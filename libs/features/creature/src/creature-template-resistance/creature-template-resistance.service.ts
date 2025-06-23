import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import {
  CREATURE_TEMPLATE_RESISTANCE_ID,
  CREATURE_TEMPLATE_RESISTANCE_ID_2,
  CREATURE_TEMPLATE_RESISTANCE_TABLE,
  CreatureTemplateResistance,
} from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureTemplateResistanceService extends MultiRowEditorService<CreatureTemplateResistance> {
  protected override readonly handlerService = inject(CreatureHandlerService);

  override FIRST_ROW_START_VALUE = 1;

  protected override readonly _entityClass = CreatureTemplateResistance;
  protected override readonly _entityTable = CREATURE_TEMPLATE_RESISTANCE_TABLE;
  protected override readonly _entityIdField = CREATURE_TEMPLATE_RESISTANCE_ID;
  protected override readonly _entitySecondIdField = CREATURE_TEMPLATE_RESISTANCE_ID_2;

  constructor() {
    super();
  }
}
