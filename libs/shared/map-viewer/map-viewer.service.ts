import { inject, Service } from '@angular/core';
import { SqliteQueryService } from '@keira/shared/db-layer';
import { MAP_CONFIG, WorldMapArea, WorldMapOverlay } from './map-viewer.model';

@Service()
export class MapViewerService {
  private readonly sqliteQueryService = inject(SqliteQueryService);

  getMapImage(mapId: number): string {
    return this.getMapImageLocal(mapId) || this.getMapImageUrl(mapId);
  }

  getMapImageUrl(mapId: number): string {
    return `${MAP_CONFIG.baseUrl}${mapId}.${MAP_CONFIG.format}`;
  }

  getMapImageLocal(mapId: number): string {
    return `assets/img/maps/${mapId}.${MAP_CONFIG.format}`;
  }

  private areasByMapId?: Promise<ReadonlyMap<number, WorldMapArea[]>>;
  private overlaysByArea?: Promise<ReadonlyMap<number, WorldMapOverlay[]>>;

  getAllAreas(): Promise<WorldMapArea[]> {
    return this.sqliteQueryService.getAllWorldMapAreas();
  }

  getAllOverlays(): Promise<WorldMapOverlay[]> {
    return this.sqliteQueryService.getAllWorldMapOverlays();
  }

  /** Spawnable zones indexed by MapID (AreaID 0 continent entries excluded). Built once and reused. */
  getAreasByMapId(): Promise<ReadonlyMap<number, WorldMapArea[]>> {
    this.areasByMapId ??= this.getAllAreas().then((areas) => {
      const byMap = new Map<number, WorldMapArea[]>();
      for (const area of areas) {
        if (area.AreaID === 0) continue;
        const list = byMap.get(area.MapID);
        if (list) {
          list.push(area);
        } else {
          byMap.set(area.MapID, [area]);
        }
      }
      return byMap;
    });
    return this.areasByMapId;
  }

  /** Overlay rectangles indexed by parent zone (WorldMapArea.ID). Built once and reused. */
  getOverlaysByArea(): Promise<ReadonlyMap<number, WorldMapOverlay[]>> {
    this.overlaysByArea ??= this.getAllOverlays().then((overlays) => {
      const byArea = new Map<number, WorldMapOverlay[]>();
      for (const overlay of overlays) {
        const list = byArea.get(overlay.mapAreaId);
        if (list) {
          list.push(overlay);
        } else {
          byArea.set(overlay.mapAreaId, [overlay]);
        }
      }
      return byArea;
    });

    return this.overlaysByArea;
  }

  resolveMapImageId(area: WorldMapArea): number {
    return area.AreaID;
  }
}
