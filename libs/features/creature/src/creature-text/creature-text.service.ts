import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { CREATURE_ID, CREATURE_TEXT_TABLE, CreatureText, TEXT_ID } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureTextService extends MultiRowEditorService<CreatureText> {
  constructor(protected handlerService: CreatureHandlerService) {
    super(CreatureText, CREATURE_TEXT_TABLE, CREATURE_ID, TEXT_ID, handlerService);
  }
}
