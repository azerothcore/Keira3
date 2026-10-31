import { ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';
import { KeepAliveRouteStrategy } from './keep-alive.strategy';

describe('KeepAliveRouteStrategy', () => {
  const route = (path: string | undefined, keepAlive = false) =>
    ({ data: keepAlive ? { keepAlive } : {}, routeConfig: path === undefined ? null : { path } }) as unknown as ActivatedRouteSnapshot;

  it('keeps the pages marked keepAlive, shows them again, and lets them go', () => {
    const strategy = new KeepAliveRouteStrategy();
    const editor = route('world-editor', true);
    expect(strategy.shouldDetach(route('creature'))).toBe(false);
    expect(strategy.shouldDetach(route(undefined, true))).toBe(false);
    expect(strategy.shouldDetach(editor)).toBe(true);
    expect(strategy.shouldAttach(editor)).toBe(false);
    expect(strategy.retrieve(editor)).toBeNull();
    const destroy = vi.fn();
    const handle = { componentRef: { destroy } } as unknown as DetachedRouteHandle;
    strategy.store(editor, handle);
    expect(strategy.shouldAttach(editor)).toBe(true);
    expect(strategy.shouldAttach(route('creature'))).toBe(false);
    expect(strategy.retrieve(editor)).toBe(handle);
    expect(strategy.retrieve(route('creature'))).toBeNull();
    strategy.store(editor, null);
    expect(strategy.shouldAttach(editor)).toBe(false);
    strategy.store(editor, handle);
    strategy.drop('world-editor');
    expect(destroy).toHaveBeenCalled();
    expect(strategy.shouldAttach(editor)).toBe(false);
    // (nothing kept: nothing to let go)
    strategy.drop('world-editor');
    strategy.store(editor, {} as DetachedRouteHandle);
    strategy.drop('world-editor');
  });
});
