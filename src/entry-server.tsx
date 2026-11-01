import { Writable } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { AppRoutes } from './AppRoutes';
import { BASENAME } from './lib/base';

type Phase = 'pending' | 'fulfilled' | 'rejected';

interface StreamControl {
  pipe: (dest: NodeJS.WritableStream) => void;
  abort: () => void;
}

const TIMEOUT_MS = 10_000;

/**
 * 渲染单个路由为 HTML 字符串。
 *
 * 使用 `renderToPipeableStream` + `onAllReady`：确保所有 Suspense 边界就绪后才输出，
 * 不会把 fallback 当作正文写入产物（`renderToString` 不具备该保证）。
 *
 * 状态机为 pending / fulfilled / rejected 三态，`settle()` 先锁状态再执行副作用，
 * 保证 Promise 只结算一次。
 */
export function renderPage(fullPath: string): Promise<string> {
  const element = (
    <StaticRouter basename={BASENAME} location={fullPath}>
      <AppRoutes />
    </StaticRouter>
  );

  return new Promise<string>((resolve, reject) => {
    let phase: Phase = 'pending';
    let html = '';
    let ctrl: StreamControl | null = null;
    let piped = false;
    // 用持有对象保存 timer，避免 let 变量只赋值一次触发的 prefer-const
    const hold: { timer?: ReturnType<typeof setTimeout> } = {};

    const settle = (next: Exclude<Phase, 'pending'>, fn: () => void) => {
      if (phase !== 'pending') return;
      phase = next;
      if (hold.timer !== undefined) clearTimeout(hold.timer);
      fn();
    };

    const abortQuietly = () => {
      try {
        ctrl?.abort();
      } catch {
        /* abort 失败不影响结算 */
      }
    };

    const startPipe = () => {
      if (phase !== 'pending' || piped) return;
      const c = ctrl;
      if (!c) {
        // 回调可能在 renderToPipeableStream 返回前触发，推迟到 ctrl 就绪
        queueMicrotask(startPipe);
        return;
      }
      piped = true;

      const sink = new Writable({
        write(chunk, _enc, cb) {
          html += chunk.toString();
          cb();
        },
      });
      sink.on('finish', () => settle('fulfilled', () => resolve(html)));
      sink.on('error', (e: Error) => settle('rejected', () => reject(e)));

      try {
        c.pipe(sink);
      } catch (e) {
        settle('rejected', () => reject(e instanceof Error ? e : new Error(String(e))));
      }
    };

    try {
      ctrl = renderToPipeableStream(element, {
        onAllReady: startPipe,
        onShellError: (e) =>
          settle('rejected', () => {
            abortQuietly();
            reject(e);
          }),
        onError: (e) =>
          settle('rejected', () => {
            abortQuietly();
            reject(e instanceof Error ? e : new Error(String(e)));
          }),
      });
    } catch (e) {
      settle('rejected', () => reject(e instanceof Error ? e : new Error(String(e))));
      return;
    }

    hold.timer = setTimeout(() => {
      settle('rejected', () => {
        abortQuietly();
        reject(new Error(`SSR 渲染超时（${TIMEOUT_MS}ms）：${fullPath}`));
      });
    }, TIMEOUT_MS);
  });
}
