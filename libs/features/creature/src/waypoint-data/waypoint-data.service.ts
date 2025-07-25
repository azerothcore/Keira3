import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { WAYPOINT_DATA_TABLE, WAYPOINT_DATA_ID, WAYPOINT_DATA_ID_2, WaypointData } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class WaypointDataService extends MultiRowEditorService<WaypointData> {
  override FIRST_ROW_START_VALUE = 1;

  constructor(protected override readonly handlerService: CreatureHandlerService) {
    super(
      WaypointData,
      WAYPOINT_DATA_TABLE,
      WAYPOINT_DATA_ID,
      WAYPOINT_DATA_ID_2,
      handlerService,
    );
  }
}
