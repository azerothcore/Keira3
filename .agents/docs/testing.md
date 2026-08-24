# Testing

- Vitest via `@analogjs/vite-plugin-angular`. Each lib has `vitest.config.ts` wrapping the root `vitest.base.config.ts`.
- When the Nx daemon can't start (e.g. sandboxed runs of `nx test`/`nx lint`), run the wrapped tools directly: `cd libs/features/<name> && npx vitest run` (the base config globs `**/*.spec.ts` relative to cwd, so run from the lib dir, not the repo root) and `npx eslint libs/features/<name>/src --max-warnings=0` per-feature (linting all libs at once can OOM V8).
- Native Vitest API: `vi.fn`, `vi.spyOn`, `expect.any`, `expect.objectContaining`. `ts-mockito` available for class mocking.
- Tests live next to source: `foo.service.spec.ts` (unit). Integration tests use `.integration.spec.ts` and the PageObject pattern from `@keira/shared/test-utils`: `PageObject`, `EditorPageObject<T>`, `MultiRowEditorPageObject<T>`, `SelectPageObject<T>`, `QueryOutputComponentPage`. Integration tests mock only the DB layer.
- **100% coverage** enforced on statements / lines / branches / functions (`vitest.base.config.ts`). For genuinely untestable branches use `/* istanbul ignore next */`.
- Keep boilerplate `should be created` service specs — they exercise the constructor and count toward coverage. Upgrade to real assertions when a service has custom logic; never delete them just because they "add no signal".
- E2E: `apps/keira-e2e/` (Playwright).
