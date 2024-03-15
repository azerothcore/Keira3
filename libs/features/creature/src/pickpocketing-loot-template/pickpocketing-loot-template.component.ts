import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LootTemplateIdComponent } from '@keira/shared/base-abstract-classes';
import { PickpocketingLootTemplate } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';
import { PickpocketingLootTemplateService } from './pickpocketing-loot-template.service';
import { LootEditorComponent } from '@keira/shared/loot-editor';
import { NgIf } from '@angular/common';
import { TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-pickpocketing-loot-template',
  templateUrl: '../../../../shared/base-abstract-classes/src/components/editors/loot-template/loot-template-id.component.html',
  standalone: true,
  imports: [TopBarComponent, NgIf, LootEditorComponent],
})
export class PickpocketingLootTemplateComponent extends LootTemplateIdComponent<PickpocketingLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: PickpocketingLootTemplateService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
