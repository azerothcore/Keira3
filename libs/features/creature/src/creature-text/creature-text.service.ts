import { Injectable, inject } from '@angular/core';
import { CREATURE_ID, CREATURE_TEXT_TABLE, CreatureText, EXTRA_ID, TEXT_ID } from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureTextService extends MultiRowEditorService<CreatureText> {
  protected override readonly handlerService: CreatureHandlerService;

  constructor() {
    const handlerService = inject(CreatureHandlerService);

    super(CreatureText, CREATURE_TEXT_TABLE, CREATURE_ID, TEXT_ID, handlerService, EXTRA_ID);

    this.handlerService = handlerService;
  }
}
