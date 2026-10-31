import { Service, signal, Signal } from '@angular/core';
import { SAI_WAYPOINTS_TABLE, SaiWaypoints } from '@keira/shared/acore-world-model';
import { HandlerService } from '@keira/shared/base-abstract-classes';

/** The SmartAI path (`waypoints.entry`) being edited. */
@Service()
export class SaiWaypointsHandlerService extends HandlerService<SaiWaypoints> {
  protected readonly mainEditorRoutePath = 'waypoints/sai-waypoints';

  get isSaiWaypointsTableUnsaved(): Signal<boolean> {
    return this.statusMap[SAI_WAYPOINTS_TABLE].asReadonly();
  }

  protected _statusMap = {
    [SAI_WAYPOINTS_TABLE]: signal(false),
  };
}
