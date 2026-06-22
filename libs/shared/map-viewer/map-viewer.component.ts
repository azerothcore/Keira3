import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { TranslateDirective } from '@ngx-translate/core';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import {
  CAPITAL_AREA_IDS,
  MAP_CANVAS_H,
  MAP_CANVAS_W,
  MapDisplayData,
  MapPoint,
  RenderedPoint,
  WorldMapArea,
  WorldMapOverlay,
  worldToMapPercent,
} from './map-viewer.model';
import { MapViewerService } from './map-viewer.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-map-viewer',
  imports: [TranslateDirective, NgTemplateOutlet, ModalModule],
  templateUrl: './map-viewer.component.html',
  styleUrl: './map-viewer.component.scss',
})
export class MapViewerComponent {
  private readonly mapViewerService = inject(MapViewerService);

  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly maps = signal<MapDisplayData[]>([]);
  private readonly hidden = signal<Set<string>>(new Set());
  protected readonly modalMap = signal<MapDisplayData | null>(null);
  private readonly fullMapModal = viewChild<ModalDirective>('fullMapModal');

  readonly points = input<MapPoint[]>([]);
  readonly compact = input<boolean>(false);
  readonly pinClick = output<MapPoint>();

  constructor() {
    effect(() => void this.resolveMaps(this.points()));
  }

  protected onMapClick(map: MapDisplayData): void {
    this.modalMap.set(map);
    this.fullMapModal()?.show();
  }

  protected closeModal(): void {
    this.fullMapModal()?.hide();
  }

  protected isVisible(uid: string): boolean {
    return !this.hidden().has(uid);
  }

  protected toggleVisible(uid: string): void {
    this.hidden.update((set) => this.toggled(set, uid));
  }

  private toggled(set: Set<string>, uid: string): Set<string> {
    const next = new Set(set);
    if (next.has(uid)) {
      next.delete(uid);
    } else {
      next.add(uid);
    }
    return next;
  }

  protected onPinClick(point: RenderedPoint, event: Event): void {
    // Stop the click from bubbling to the map container, which would toggle expand/reduce.
    event.stopPropagation();
    this.pinClick.emit(point);
  }

  private resolveGeneration = 0;

  private async resolveMaps(pts: MapPoint[]): Promise<void> {
    // Drop results from a superseded call (points() can change while a previous resolve is awaiting).
    const generation = ++this.resolveGeneration;

    if (!pts.length) {
      this.maps.set([]);
      return;
    }

    this.loading.set(true);
    this.loadError.set(null);

    try {
      // Both indexes are built once and cached in the (singleton) service, shared across instances.
      const areasByMapId = await this.mapViewerService.getAreasByMapId();
      const overlaysByArea = await this.mapViewerService.getOverlaysByArea();

      // Each tile holds the points matched geometrically to one area.
      const tiles = new Map<string, { area: WorldMapArea; points: MapPoint[] }>();

      const tileFor = (area: WorldMapArea) => {
        const uid = `${area.MapID}-${area.AreaID}`;
        let tile = tiles.get(uid);
        if (!tile) {
          tile = { area, points: [] };
          tiles.set(uid, tile);
        }
        return tile;
      };

      for (const pt of pts) {
        // Only zones on the spawn's own map: different continents (map 0 vs map 1) reuse overlapping
        // x/y ranges, so an Elwynn point (map 0) must not be tested against Tanaris (map 1).
        const candidates = (areasByMapId.get(pt.mapId) ?? []).filter((a) => worldToMapPercent(pt.x, pt.y, a) !== null);

        if (!candidates.length) {
          console.warn(`[MapViewer] point "${pt.name}" (x=${pt.x}, y=${pt.y}): no area matched — skipping`);
          continue;
        }

        tileFor(this.selectArea(pt, candidates, overlaysByArea)).points.push(pt);
      }

      const result: MapDisplayData[] = [];

      for (const [uid, { area, points }] of tiles) {
        const imageMapId = this.mapViewerService.resolveMapImageId(area);

        const projected = points.map((p) => this.project(p, area));
        this.spreadCoincidentPoints(projected);

        result.push({
          uid,
          mapId: imageMapId,
          imageUrl: this.mapViewerService.getMapImageUrl(imageMapId),
          area,
          points: projected,
        });
      }

      if (generation === this.resolveGeneration) {
        this.maps.set(result);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[MapViewer] resolveMaps failed:', err);
      if (generation === this.resolveGeneration) {
        this.loadError.set(message);
        this.maps.set([]);
      }
    } finally {
      if (generation === this.resolveGeneration) {
        this.loading.set(false);
      }
    }
  }

  /**
   * Resolves which zone an in-bounds spawn belongs to:
   * 1. A capital city wins outright (it sits inside its surrounding zone's box).
   * 2. Otherwise keep zones whose WorldMapOverlay rectangles actually cover the point — this carves
   *    out the bounding-box "bleed" where one zone's box overlaps a neighbour's (Westfall vs
   *    Stranglethorn). Falls back to all candidates when none qualify (zones without overlay data).
   * 3. Among the survivors, the most central zone (smallest projected distance to centre) wins.
   */
  private selectArea(point: MapPoint, candidates: WorldMapArea[], overlaysByArea: ReadonlyMap<number, WorldMapOverlay[]>): WorldMapArea {
    const capitals = candidates.filter((a) => CAPITAL_AREA_IDS.has(a.AreaID));
    if (capitals.length) {
      return this.closestToCentre(point, capitals);
    }

    const covered = candidates.filter((a) => this.pointInOverlays(point, a, overlaysByArea.get(a.ID)));
    return this.closestToCentre(point, covered.length ? covered : candidates);
  }

  private closestToCentre(point: MapPoint, areas: WorldMapArea[]): WorldMapArea {
    return areas.reduce((best, area) => (this.getAreaScore(point, area) < this.getAreaScore(point, best) ? area : best));
  }

  private pointInOverlays(point: MapPoint, area: WorldMapArea, overlays?: WorldMapOverlay[]): boolean {
    if (!overlays?.length) return false;

    const pct = worldToMapPercent(point.x, point.y, area)!; // candidate => guaranteed in-bounds
    const px = pct.left * MAP_CANVAS_W;
    const py = pct.top * MAP_CANVAS_H;

    return overlays.some((o) => px >= o.x && px <= o.x + o.w && py >= o.y && py <= o.y + o.h);
  }

  // Squared distance from the projected point to the map centre (0.5, 0.5), in 0..1 map space.
  // Projected space is inherently scale-normalised and uses the correct axes (cf. aowow worldPosToZonePos).
  private getAreaScore(point: MapPoint, area: WorldMapArea): number {
    const pct = worldToMapPercent(point.x, point.y, area)!; // candidate => guaranteed in-bounds
    const dx = pct.left - 0.5;
    const dy = pct.top - 0.5;
    return dx * dx + dy * dy;
  }

  protected onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.error(`[MapViewer] image failed to load: ${img.src}`);
    img.style.visibility = 'hidden';
  }

  // Pins that project to the exact same spot (e.g. an NPC that is both quest starter and ender)
  // are nudged apart horizontally so each icon stays visible instead of stacking on top of the others.
  private spreadCoincidentPoints(points: RenderedPoint[]): void {
    const SPREAD_PX = 14;
    const groups = new Map<string, RenderedPoint[]>();

    for (const point of points) {
      const key = `${point.left}|${point.top}`;
      const group = groups.get(key) ?? [];
      group.push(point);
      groups.set(key, group);
    }

    for (const group of groups.values()) {
      if (group.length < 2) continue;

      const start = -((group.length - 1) / 2) * SPREAD_PX;
      group.forEach((point, i) => (point.offsetX = start + i * SPREAD_PX));
    }
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
