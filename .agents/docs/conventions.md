# Conventions

- Standalone components only — no NgModules. Every template dependency must be listed in `imports: [...]`.
- `ChangeDetectionStrategy.OnPush` mandatory (ESLint: `@angular-eslint/prefer-on-push-component-change-detection`). App is zoneless (`provideZonelessChangeDetection()`); after async state mutation outside the form pipeline, call `changeDetectorRef.markForCheck()` (base `EditorService` already does this in `save`/`reload`).
- Angular Signals for cross-component reactive state (e.g. handler unsaved flags).
- DI via `inject()`, not constructor injection.
- Component selector prefix: `keira-` (kebab-case element / camelCase directive).
- Self-closing tags required in templates.
- `no-console`: only `console.warn` / `console.info` / `console.error` allowed. User-facing messages → `ToastrService`.
- Prettier 140-char width, single quotes, trailing commas. Husky pre-commit runs `pretty-quick --staged`.
