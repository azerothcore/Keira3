import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BossBoundary, BoundaryPoint, boundaryOutline, BoundaryShape, describeBoundary, WowClientService } from '@keira/shared/wow-data';
import { TranslatePipe } from '@ngx-translate/core';
import { sourceFolderSet } from '../source-folder';
import { TableSort } from '../table-sort';

/** The middle of the first flat shape of a boundary (to look at it), undefined when it has none (heights only). */
export function boundaryCenter(shapes: BoundaryShape[]): BoundaryPoint | undefined {
  for (const shape of shapes) {
    const center =
      shape.type === 'union' || shape.type === 'intersect'
        ? boundaryCenter(shape.shapes)
        : (() => {
            const points = boundaryOutline(shape, 8);
            return (
              points && {
                x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
                y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
              }
            );
          })();
    if (center) {
      return center;
    }
  }
  return undefined;
}

/**
 * Boss boundaries: the areas the instance scripts keep each boss in (what `.debug boundary` shows), by instance, with
 * their shapes, the creatures they apply to, and a way to see each in the World Editor.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-boss-boundaries',
  templateUrl: './boss-boundaries.component.html',
  imports: [TranslatePipe, RouterLink],
})
export class BossBoundariesComponent implements OnInit {
  private readonly client = inject(WowClientService);
  private readonly router = inject(Router);
  protected readonly hasSource = sourceFolderSet();
  protected readonly boundaries = signal<BossBoundary[] | undefined>(undefined);
  protected readonly error = signal('');
  protected readonly filter = signal('');
  protected readonly describe = describeBoundary;
  protected readonly center = boundaryCenter;

  protected readonly sort = new TableSort<BossBoundary>({
    map: (boundary) => boundary.mapId,
    instance: (boundary) => boundary.instance,
    boss: (boundary) => boundary.boss,
    shapes: (boundary) => boundary.shapes.length,
    scriptName: (boundary) => boundary.scriptNames.join(', '),
  });
  protected readonly sorted = computed(() => this.sort.apply(this.shown()));

  protected readonly shown = computed(() => {
    const text = this.filter().trim().toLowerCase();
    // (only read once they're read)
    return (this.boundaries() as BossBoundary[]).filter((boundary) =>
      [boundary.instance, boundary.boss, String(boundary.mapId), ...boundary.scriptNames].some((value) =>
        value.toLowerCase().includes(text),
      ),
    );
  });

  ngOnInit(): void {
    if (this.hasSource()) {
      this.client.getAllBossBoundaries().then(
        (boundaries) => this.boundaries.set(boundaries),
        (error: Error) => {
          this.boundaries.set([]);
          this.error.set(error.message);
        },
      );
    }
  }

  protected setFilter(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  /** Shows a boundary in the World Editor (with View > Boss boundaries). */
  protected showIn3d(boundary: BossBoundary, at: BoundaryPoint): void {
    void this.router.navigate(['world-editor'], { queryParams: { map: boundary.mapId, x: at.x, y: at.y } });
  }
}
