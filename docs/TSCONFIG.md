# TypeScript 配置说明（TSCONFIG）

## 1. 双包 alias（实测结果）

```jsonc
"@typescript/native": "npm:typescript@7.0.2",       // bin: tsc
"typescript": "npm:@typescript/typescript6@6.0.2"   // bin: tsc6 + TS6 API
```

实测（本机，2026-11-01）：

| 命令 | 输出 | 说明 |
|---|---|---|
| `npx tsc --version` | **7.0.2** | 原生 Go 编译器 |
| `npx tsc6 --version` | **6.0.3** | 兼容包的 bin 实际包装 `@typescript/old: npm:typescript@^6`，解析到 6.0.3 |

> `tsc6` 报 6.0.3 而非 6.0.2 属预期：`@typescript/typescript6@6.0.2` 是**包装包**，
> 内部依赖 `typescript@^6`，实际编译器版本由该依赖决定。`typescript-eslint` 的 peer
> 检查读取的是包装包版本 6.0.2（满足 `<6.1.0`），因此 peer 通过。

## 2. 四份配置的职责与 rootDir

`rootDir` **不在** `tsconfig.base.json`，由各配置显式声明——否则 node 配置覆盖根目录的
`*.config.ts` 与 `scripts/**` 时会与 `rootDir: "./src"` 冲突。

| 配置 | rootDir | include | types | 备注 |
|---|---|---|---|---|
| `tsconfig.json` | `./src` | `src/**/*.ts`、`src/**/*.tsx`、`src/**/*.d.ts` | `vite/client` | 含单元测试；排除 `src/map/fixtures/**` 与 `src/entry-server.tsx` |
| `tsconfig.ssr.json` | `./src` | 同上 | `node`、`vite/client` | SSR 入口在此检查 |
| `tsconfig.node.json` | `./` | `*.config.ts`、`*.config.js`、`eslint.config.js`、`scripts/**/*.ts`、`scripts/**/*.mjs` | `node` | `allowJs` + `checkJs` |
| `e2e/tsconfig.json` | `./` | `**/*.ts` | `node` | 相对 e2e 目录 |

**`include` 不使用 `{}` 花括号展开**——TypeScript 的 `include` 不支持该语法，写了会静默匹配空集，
`tsc` 仍退出 0。

**`src/entry-server.tsx` 从 `tsconfig.json` 排除**：它 `import 'node:stream'`，
而应用配置的 `types` 只有 `vite/client`，不应把 Node 全局引入浏览器侧代码。
该文件由 `tsconfig.ssr.json` 检查。

## 3. 文件清单验证（`npm run typecheck:files`）

退出码 0 不能证明文件真的进了项目。`scripts/list-ts-files.mjs` 对四份配置各跑
`tsc -p <cfg> --listFilesOnly`，断言关键文件出现在清单中，并把清单落盘到
`docs/ts-files-report.json` 作为物证。

## 4. Node 脚本的类型检查

9 个核心构建脚本保持 `.mjs`，用 **JSDoc + `// @ts-check` + `checkJs: true`** 做类型检查。
**不迁 `.ts`**：Node 22 的 TS 执行支持仍属实验性，不为类型检查引入运行时风险。

JSDoc 的 `import()` 使用 `.js` 扩展名（NodeNext 下映射到 `types.ts` 源文件）：

```js
/** @typedef {import('../src/map/types.js').MapNodeInput} MapNodeInput */
```

## 5. 职责边界

| 职责 | 工具 | 说明 |
|---|---|---|
| 类型检查（唯一权威） | `tsc` 7.0.2 | 四份 `-p` 依次执行，任一失败即 CI 失败 |
| ESLint 类型感知 | `typescript-eslint` + TS 6.0.2 API | 通过 alias 满足 peer |
| 分歧处理 | 以 `tsc` 为准 | ESLint 报错但 `tsc` 通过 → 该规则降级为 warn 并记录；反之必须改代码 |

## 6. 编辑器识别

| 文件 | 归属 |
|---|---|
| `src/**`（除 `entry-server.tsx`） | 根 `tsconfig.json` |
| `src/entry-server.tsx` | 无就近配置 → 编辑器退回推断项目（CI 由 `tsconfig.ssr.json` 强制） |
| `e2e/**` | `e2e/tsconfig.json`（就近命中） |
| `*.config.ts` / `*.config.js` / `scripts/**` | 编辑器退回推断项目（CI 由 `tsconfig.node.json` 强制） |

已知限制：无 project references 时，编辑器无法为上述文件提供项目级类型上下文。
这是刻意取舍——`composite: true` 隐含 `declaration: true` 且禁止禁用 emit，与 `noEmit` 互斥。

## 7. 禁用项（TS 7 硬报错）

`target: es5`、`downlevelIteration`、`moduleResolution: node|node10|classic`、
`module: amd|umd|systemjs|none`、**`baseUrl`**、`esModuleInterop: false`、
`allowSyntheticDefaultImports: false`、`alwaysStrict: false`。

TS 7 新默认值（本项目显式写死）：`strict: true`、`module: esnext`、
`noUncheckedSideEffectImports: true`、`rootDir: ./`、**`types: []`**、`stableTypeOrdering: true`。
