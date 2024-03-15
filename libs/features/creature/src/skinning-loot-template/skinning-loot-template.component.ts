import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LootTemplateIdComponent } from '@keira/shared/base-abstract-classes';
import { SkinningLootTemplate } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';
import { SkinningLootTemplateService } from './skinning-loot-template.service';
import { LootEditorComponent } from '@keira/shared/loot-editor';
import { NgIf } from '@angular/common';
import { TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-skinning-loot-template',
  templateUrl: '../../../../shared/base-abstract-classes/src/components/editors/loot-template/loot-template-id.component.html',
  standalone: true,
  imports: [TopBarComponent, NgIf, LootEditorComponent],
})
export class SkinningLootTemplateComponent extends LootTemplateIdComponent<SkinningLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: SkinningLootTemplateService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
