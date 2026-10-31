import { ComponentRef, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, BaseRouteReuseStrategy, DetachedRouteHandle } from '@angular/router';

/** The route of a page kept alive while another tab is shown (its `data.keepAlive`), by its path. */
const keptPath = (route: ActivatedRouteSnapshot): string | undefined =>
  route.data['keepAlive'] && route.routeConfig?.path !== undefined ? route.routeConfig.path : undefined;

/**
 * Keeps pages marked `data: { keepAlive: true }` alive when another tab is opened (the World Editor: its 3D view, what
 * it loaded and where its camera is), and shows them again as they were; `drop` lets one go when its tab is closed.
 */
@Injectable({ providedIn: 'root' })
export class KeepAliveRouteStrategy extends BaseRouteReuseStrategy {
  private readonly kept = new Map<string, DetachedRouteHandle>();
  /** Set while switching between two tabs of the same part: the page is made again (with the other tab's state). */
  renew = false;

  override shouldReuseRoute(future: ActivatedRouteSnapshot, current: ActivatedRouteSnapshot): boolean {
    const page = !future.firstChild && !!future.routeConfig?.component;
    return super.shouldReuseRoute(future, current) && !(this.renew && page);
  }

  override shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return keptPath(route) !== undefined;
  }

  override store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    const path = keptPath(route) as string;
    if (handle) {
      this.kept.set(path, handle);
    } else {
      this.kept.delete(path);
    }
  }

  override shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const path = keptPath(route);
    return path !== undefined && this.kept.has(path);
  }

  override retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const path = keptPath(route);
    return (path !== undefined && this.kept.get(path)) || null;
  }

  /** Lets a kept page go (its tab closed): it starts afresh next time. */
  drop(path: string): void {
    const handle = this.kept.get(path) as { componentRef?: ComponentRef<unknown> } | undefined;
    this.kept.delete(path);
    handle?.componentRef?.destroy();
  }
}
