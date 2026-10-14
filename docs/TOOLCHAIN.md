# Frontend compiler and lint tooling

The application uses Node 24, Next.js 16.4 and React 19.3. Install the checked-in lockfile with `npm ci` before running `npm run verify` and `npm run build`.

## TypeScript 7 and the compiler API

`@typescript/native` is an npm alias for TypeScript 7. `npm run typecheck` invokes that package's compiler directly, so npm executable-link ordering cannot select a different compiler.

The `typescript` dependency is an alias for `@typescript/typescript6`. It supplies the JavaScript compiler API still required by typescript-eslint and other tools. It does not replace the TypeScript 7 compiler used by the project's typecheck command. Next.js uses its CLI checker during the production build; the clean lockfile installation supplies TypeScript 7's `tsc`.

This follows Microsoft's [side-by-side compiler guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0). Use the native compiler for checks and the compatibility API for tools that import `typescript`.

## ESLint 10

`eslint-config-next` is pinned to the Next.js version. `@eslint/compat` adapts the legacy rule-context methods still used by some included React plugins. The original Next, React, accessibility and TypeScript rules remain enabled through `fixupConfigRules`.

Some plugins still declare ESLint 9 peer ranges. npm therefore reports peer warnings for ESLint 10; installation must succeed without `--force` or `--legacy-peer-deps`, and the lint command must pass. Do not remove checks to hide an incompatible plugin update.

## Validation

`npm run verify` runs lint, the native compiler and unit tests. CI also performs the production dependency audit, build, critical browser tests, and admin/support browser tests against an isolated backend and database. A historical green run does not validate a different commit.
