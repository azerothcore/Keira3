import { inject, Service } from '@angular/core';
import { SqliteQueryService } from '@keira/shared/db-layer';
import { MAP_CONFIG, WorldMapArea } from './map-viewer.model';

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

  getAllAreas(): Promise<WorldMapArea[]> {
    return this.sqliteQueryService.getAllWorldMapAreas();
  }

  resolveDisplayMapId(area: WorldMapArea): number {
    if (area.DisplayMapID > 0) return area.DisplayMapID;
    if (area.MapID > 0) return area.MapID;
    return area.AreaID;
  }
}
