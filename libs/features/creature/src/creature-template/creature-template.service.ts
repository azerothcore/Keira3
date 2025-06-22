import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { CREATURE_TEMPLATE_ID, CREATURE_TEMPLATE_NAME, CREATURE_TEMPLATE_TABLE, CreatureTemplate } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureTemplateService extends SingleRowEditorService<CreatureTemplate> {
  protected override readonly handlerService = inject(CreatureHandlerService);

  constructor() {
    super(CreatureTemplate, CREATURE_TEMPLATE_TABLE, CREATURE_TEMPLATE_ID, CREATURE_TEMPLATE_NAME, true);
  }
}
