import { inject, Service } from '@angular/core';
import { WAYPOINT_SCRIPTS_ID, WAYPOINT_SCRIPTS_ID_2, WAYPOINT_SCRIPTS_TABLE, WaypointScripts } from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { WaypointScriptsHandlerService } from '../waypoint-scripts-handler.service';

/**
 * The steps of a waypoint action (`waypoint_scripts`). Each step's `guid` is unique in the whole table: new steps
 * get guids above the highest one in use.
 */
@Service()
export class WaypointScriptsService extends MultiRowEditorService<WaypointScripts> {
  protected override readonly handlerService = inject(WaypointScriptsHandlerService);
  protected override readonly _entityClass = WaypointScripts;
  protected override readonly _entityTable = WAYPOINT_SCRIPTS_TABLE;
  protected override readonly _entityIdField = WAYPOINT_SCRIPTS_ID;
  protected override readonly _entitySecondIdField = WAYPOINT_SCRIPTS_ID_2;
  protected override FIRST_ROW_START_VALUE = 1;

  constructor() {
    super();
    this.init();
  }

  protected override onReloadSuccessful(data: WaypointScripts[], id: string | number): void {
    super.onReloadSuccessful(data, id);
    this.subscriptions.push(
      this.queryService.getMaxId(WAYPOINT_SCRIPTS_TABLE, WAYPOINT_SCRIPTS_ID_2).subscribe((rows) => {
        this.FIRST_ROW_START_VALUE = Number(rows?.[0]?.max ?? 0) + 1;
        this._nextRowId = Math.max(this._nextRowId, this.FIRST_ROW_START_VALUE);
      }),
    );
  }
}
