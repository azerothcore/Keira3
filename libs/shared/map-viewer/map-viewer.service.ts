import { inject, Injectable } from '@angular/core';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { MAP_CONFIG, WorldMapArea } from './map-viewer.model';

@Injectable({
  providedIn: 'root',
})
export class MapViewerService {
  private readonly mysqlQueryService = inject(MysqlQueryService);

  getMapImageUrl(mapId: number): string {
    return `${MAP_CONFIG.baseUrl}${mapId}.${MAP_CONFIG.format}`;
  }

  getAllAreas(): Promise<WorldMapArea[]> {
    return this.mysqlQueryService.getAllWorldMapAreas();
  }

  resolveDisplayMapId(area: WorldMapArea): number {
    if (area.DisplayMapID > 0) return area.DisplayMapID;
    if (area.MapID > 0) return area.MapID;
    return area.AreaID;
  }
}
