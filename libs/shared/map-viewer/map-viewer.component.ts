import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { MapViewerService } from './map-viewer.service';
import { MapDisplayData, MapPoint, RenderedPoint, WorldMapArea, worldToMapPercent } from './map-viewer.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-map-viewer',
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
    effect(() => void this.resolveMaps(this.points()));
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
      const areaMap = new Map<string, { area: WorldMapArea; points: MapPoint[] }>();

      for (const pt of pts) {
        const candidates = allAreas.filter((a) => a.AreaID !== 0 && worldToMapPercent(pt.x, pt.y, a) !== null);

        if (!candidates.length) {
          console.warn(`[MapViewer] point "${pt.name}" (x=${pt.x}, y=${pt.y}): no area matched — skipping`);
          continue;
        }

        const match = this.pickBestArea(pt, candidates);

        const displayMapId = this.mapViewerService.resolveDisplayMapId(match);
        const uid = `${displayMapId}-${match.AreaID}`;

        if (!areaMap.has(uid)) {
          areaMap.set(uid, { area: match, points: [] });
        }

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

  /**
   * Picks the best matching area using:
   * 1. Distance from point to area center
   * 2. Area size as tie-breaker
   *
   * Lower score wins.
   */
  private pickBestArea(point: MapPoint, candidates: WorldMapArea[]): WorldMapArea {
    return candidates.reduce((best, area) => {
      const bestScore = this.getAreaScore(point, best);
      const areaScore = this.getAreaScore(point, area);

      return areaScore < bestScore ? area : best;
    });
  }

  /**
   * Combined score:
   * - Prefer points closer to map center
   * - Prefer smaller maps when distances are similar
   */
  private getAreaScore(point: MapPoint, area: WorldMapArea): number {
    const centerX = (area.LocLeft + area.LocRight) / 2;
    const centerY = (area.LocTop + area.LocBottom) / 2;

    const dx = point.x - centerX;
    const dy = point.y - centerY;

    const distanceSq = dx * dx + dy * dy;

    const width = Math.abs(area.LocLeft - area.LocRight);
    const height = Math.abs(area.LocTop - area.LocBottom);

    const areaSize = width * height;

    // Normalize by area size so giant continent maps are penalized.
    return distanceSq / Math.max(areaSize, 1);
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
