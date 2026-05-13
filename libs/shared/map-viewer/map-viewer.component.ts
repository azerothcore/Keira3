import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapViewerService } from './map-viewer.service';
import { MapDisplayData, MapPoint, RenderedPoint, WorldMapArea, worldToMapPercent } from './map-viewer.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-map-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-viewer.component.html',
  styleUrl: './map-viewer.component.scss',
})
export class MapViewerComponent {
  private readonly mapViewerService = inject(MapViewerService);

  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly maps = signal<MapDisplayData[]>([]);

  readonly points = input<MapPoint[]>([]);

  constructor() {
    effect(() => {
      const pts = this.points();
      console.log(`[MapViewer] points changed — ${pts.length} points`);
      void this.resolveMaps(pts);
    });
  }

  private async resolveMaps(pts: MapPoint[]): Promise<void> {
    if (!pts.length) {
      this.maps.set([]);
      return;
    }

    this.loading.set(true);
    this.loadError.set(null);

    try {
      const allAreas = await this.mapViewerService.getAllAreas();

      // Group each point under the best-matching area tile.
      // "Best" = smallest tile whose bounds contain (x, y), so dungeon/subzone
      // tiles win over the continent fallback that also contains the same coord.
      const areaMap = new Map<string, { area: WorldMapArea; points: MapPoint[] }>();

      for (const pt of pts) {
        const candidates = allAreas.filter((a) => worldToMapPercent(pt.x, pt.y, a) !== null);

        if (!candidates.length) {
          console.warn(`[MapViewer] point "${pt.name}" (x=${pt.x}, y=${pt.y}): no area matched — skipping`);
          continue;
        }

        // Pick the smallest area (tightest bounds = most specific tile).
        const match = candidates.reduce((best, a) => {
          const sizeA = (best.LocLeft - best.LocRight) * (best.LocTop - best.LocBottom);
          const sizeB = (a.LocLeft - a.LocRight) * (a.LocTop - a.LocBottom);
          return sizeB < sizeA ? a : best;
        });

        const displayMapId = this.mapViewerService.resolveDisplayMapId(match);
        const uid = `${displayMapId}-${match.AreaID}`;

        console.log(`[MapViewer] point "${pt.name}" → area="${match.AreaName}" uid=${uid}`);

        if (!areaMap.has(uid)) areaMap.set(uid, { area: match, points: [] });
        areaMap.get(uid)!.points.push(pt);
      }

      // Build final display data.
      const result: MapDisplayData[] = [];

      for (const [uid, { area, points: areaPoints }] of areaMap) {
        const displayMapId = this.mapViewerService.resolveDisplayMapId(area);

        result.push({
          uid,
          mapId: displayMapId,
          imageUrl: this.mapViewerService.getMapImageUrl(displayMapId),
          area,
          points: areaPoints.map((p) => this.project(p, area)),
        });
      }

      this.maps.set(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[MapViewer] resolveMaps failed:', err);
      this.loadError.set(message);
      this.maps.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  protected onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.error(`[MapViewer] image failed to load: ${img.src}`);
    img.style.visibility = 'hidden';
  }

  private project(p: MapPoint, area: WorldMapArea): RenderedPoint {
    const pct = worldToMapPercent(p.x, p.y, area)!;
    return {
      ...p,
      left: `${pct.left * 100}%`,
      top: `${pct.top * 100}%`,
      rotateDeg: ((p.orientation ?? 0) * 180) / Math.PI,
    };
  }
}
