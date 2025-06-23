import { Injectable, inject } from '@angular/core';
import { CREATURE_ID, CREATURE_TEXT_TABLE, CreatureText, EXTRA_ID, TEXT_ID } from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureTextService extends MultiRowEditorService<CreatureText> {
  protected override readonly handlerService = inject(CreatureHandlerService);
  protected override readonly _entityClass = CreatureText;
  protected override readonly _entityTable = CREATURE_TEXT_TABLE;
  protected override readonly _entityIdField = CREATURE_ID;
  protected override readonly _entitySecondIdField = TEXT_ID;
  protected override readonly _entityExtraIdField = EXTRA_ID;

  constructor() {
    super();
  }
}
