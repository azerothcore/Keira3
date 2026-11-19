import { inject, Service } from '@angular/core';
import {
  VEHICLE_TEMPLATE_ACCESSORY_ID,
  VEHICLE_TEMPLATE_ACCESSORY_ID_2,
  VEHICLE_TEMPLATE_ACCESSORY_TABLE,
  VehicleTemplateAccessory,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { CreatureHandlerService } from '../creature-handler.service';

@Service()
export class VehicleTemplateAccessoryService extends MultiRowEditorService<VehicleTemplateAccessory> {
  protected override readonly handlerService = inject(CreatureHandlerService);
  protected override readonly _entityClass = VehicleTemplateAccessory;
  protected override readonly _entityTable = VEHICLE_TEMPLATE_ACCESSORY_TABLE;
  protected override readonly _entityIdField = VEHICLE_TEMPLATE_ACCESSORY_ID;
  protected override readonly _entitySecondIdField = VEHICLE_TEMPLATE_ACCESSORY_ID_2;

  constructor() {
    super();
    this.init();
  }
}
