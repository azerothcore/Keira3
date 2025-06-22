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

  constructor() {
    super(
      CreatureTemplateResistance,
      CREATURE_TEMPLATE_RESISTANCE_TABLE,
      CREATURE_TEMPLATE_RESISTANCE_ID,
      CREATURE_TEMPLATE_RESISTANCE_ID_2,
      handlerService,
    );
  }
}
