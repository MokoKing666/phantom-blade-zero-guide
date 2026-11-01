// @ts-check
/**
 * 验证「文件真的进了 TypeScript 项目」。
 *
 * 只凭 `tsc --noEmit` 退出码 0 不足以证明覆盖正确：
 * include 写错（例如用了不受支持的 `{}` 花括号展开）时项目会静默变成空集，
 * 退出码依然是 0。这里对每份配置跑一次 `--listFilesOnly`，
 * 断言关键文件确实出现在清单里。
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/** @type {Array<{ cfg: string, must: string[] }>} */
const TARGETS = [
  {
    cfg: 'tsconfig.json',
    must: [
      'src/entry-client.tsx',
      'src/map/types.ts',
      'src/map/coord.ts',
      'src/pages/Home.tsx',
      'src/map/__tests__/coord.test.ts',
    ],
  },
  {
    cfg: 'tsconfig.ssr.json',
    must: ['src/entry-server.tsx', 'src/map/types.ts'],
  },
  {
    cfg: 'tsconfig.node.json',
    must: [
      'vite.config.ts',
      'eslint.config.js',
      'scripts/list-ts-files.mjs',
      'scripts/ssg.mjs',
      'scripts/verify-data.mjs',
    ],
  },
  {
    cfg: 'e2e/tsconfig.json',
    must: ['e2e/smoke.spec.ts'],
  },
];

/**
 * @param {string} cfg
 * @returns {string[]}
 */
function listFiles(cfg) {
  const res = spawnSync('npx', ['--no-install', 'tsc', '-p', cfg, '--listFilesOnly'], {
    encoding: 'utf8',
    shell: true,
  });
  if (res.status !== 0) {
    console.error(`[typecheck:files] tsc -p ${cfg} 执行失败\n${res.stdout ?? ''}\n${res.stderr ?? ''}`);
    process.exit(1);
  }
  return String(res.stdout ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('error'));
}

/**
 * @param {string} file
 * @param {string} needle
 */
function matches(file, needle) {
  return file.replace(/\\/g, '/').endsWith(needle);
}

let failed = 0;
/** @type {Record<string, string[]>} */
const report = {};

// 落盘时使用相对路径：绝对路径会把本机目录结构写进产物，既不可移植也不该外泄
/**
 * @param {string} p
 * @returns {string}
 */
const rel = (p) => p.replace(/\\/g, '/').replace(`${process.cwd().replace(/\\/g, '/')}/`, '');

for (const target of TARGETS) {
  const files = listFiles(target.cfg);
  report[target.cfg] = files.map(rel);

  if (files.length === 0) {
    console.error(`[typecheck:files] ${target.cfg} 的文件清单为空 —— include 可能写错`);
    failed++;
    continue;
  }

  for (const needle of target.must) {
    if (!files.some((f) => matches(f, needle))) {
      console.error(`[typecheck:files] ${target.cfg} 未覆盖：${needle}`);
      failed++;
    }
  }
}

const outPath = resolve('docs/ts-files-report.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (failed > 0) {
  console.error(`[typecheck:files] 失败项：${failed}`);
  process.exit(1);
}

console.log('[typecheck:files] 四份配置覆盖正确');
