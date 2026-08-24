# Patches

Applied automatically on `npm install` via `patch-package` (wired into the `postinstall` script).

## ngx-bootstrap+21.2.0.patch

ngx-bootstrap 21.2.0 targets Angular 21 and has no Angular 22 release yet, but Angular 22
introduced two breaking changes it does not handle. The patch makes 21.2.0 run on Angular 22.

1. `component-loader` — Angular 22 removed `ComponentFactoryResolver`. ngx-bootstrap used
   `ComponentFactoryResolver.resolveComponentFactory()` to create modal/tooltip components
   dynamically. Rewritten to the Ivy `createComponent()` API, and the now-removed DI token is
   dropped from the injectable factory.

2. `tabs` — Angular 22 no longer refreshes a child component's bindings transitively when only a
   content-projected directive's view is marked dirty. The tabset's `[class.active]` binding lives
   in `TabsetComponent`, but `TabDirective` only marked its own (host) view via `markForCheck()`,
   so the active tab never rendered. The patch injects `ChangeDetectorRef` into `TabsetComponent`
   and marks it from `TabDirective.set active`.

Remove this patch once ngx-bootstrap publishes an Angular 22-compatible release and the dependency
is bumped to it.
