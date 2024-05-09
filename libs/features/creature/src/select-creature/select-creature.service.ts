import { inject, Injectable } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import {
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_NAME,
  CREATURE_TEMPLATE_SEARCH_FIELDS,
  CREATURE_TEMPLATE_TABLE,
  CreatureTemplate,
} from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectCreatureService extends SelectService<CreatureTemplate> {
  public readonly handlerService = inject(CreatureHandlerService);
  protected readonly entityTable = CREATURE_TEMPLATE_TABLE;
  protected readonly entityIdField = CREATURE_TEMPLATE_ID;
  protected readonly entityNameField = CREATURE_TEMPLATE_NAME;
  protected readonly fieldList = CREATURE_TEMPLATE_SEARCH_FIELDS;
}
