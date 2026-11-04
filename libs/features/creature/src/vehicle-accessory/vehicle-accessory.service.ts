import { inject, Service } from '@angular/core';
import { VEHICLE_ACCESSORY_ID_2, VEHICLE_ACCESSORY_ID_3, VEHICLE_ACCESSORY_TABLE, VehicleAccessory } from '@keira/shared/acore-world-model';
import { MultiRowExternalEditorService } from '@keira/shared/base-abstract-classes';
import { Observable } from 'rxjs';
import { CreatureHandlerService } from '../creature-handler.service';

/** The accessories of the creature's spawns, by guid and seat (vehicle_accessory). */
@Service()
export class VehicleAccessoryService extends MultiRowExternalEditorService<VehicleAccessory> {
  protected override readonly handlerService = inject(CreatureHandlerService);
  protected override _entityClass = VehicleAccessory;
  protected override _entityTable = VEHICLE_ACCESSORY_TABLE;
  protected override _entitySecondIdField = VEHICLE_ACCESSORY_ID_2;
  protected override readonly _entityExtraIdField = VEHICLE_ACCESSORY_ID_3;

  constructor() {
    super();
    this.init();
  }

  selectQuery(id: string | number): Observable<VehicleAccessory[]> {
    return this.queryService.query<VehicleAccessory>(
      `SELECT a.* FROM creature AS c INNER JOIN vehicle_accessory AS a ON c.guid = a.guid WHERE c.id1 = ${Number(id)} ORDER BY a.guid, a.seat_id`,
    );
  }
}
