import { Router } from '@angular/router';

/** A spawn to show in the World Editor. */
export interface PoolPlace {
  type: 'creature' | 'gameobject';
  guid: number;
  map: number;
  x: number;
  y: number;
  z: number;
}

/** Opens the World Editor (its tab) at a spawn, selected. */
export function showInWorldEditor(router: Router, place: PoolPlace): void {
  void router.navigate(['world-editor'], {
    queryParams: { map: place.map, x: place.x, y: place.y, z: place.z, select: `${place.type}:${place.guid}` },
  });
}

/** Opens another pool in the Pool Editor (going through the start page, as it may be the page already shown). */
export function openPool(
  router: Router,
  handler: { select(isNew: boolean, id: number, name: string, navigate: boolean): void },
  id: number,
): void {
  handler.select(false, id, `${id}`, false);
  void router.navigateByUrl('/', { skipLocationChange: true }).then(() => router.navigate(['pools/pool-template']));
}
