import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LootTemplateIdComponent } from '@keira/shared/core';
import { DisenchantLootTemplate } from '@keira/shared/acore-world-model';
import { ItemHandlerService } from '../item-handler.service';
import { DisenchantLootTemplateService } from './disenchant-loot-template.service';
import { LootEditorComponent } from '@keira/shared/core';
import { NgIf } from '@angular/common';
import { TopBarComponent } from '@keira/shared/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-disenchant-loot-template',
  templateUrl: '../../../../../libs/shared/core/src/abstract/components/editors/loot-template/loot-template-id.component.html',
  standalone: true,
  imports: [TopBarComponent, NgIf, LootEditorComponent],
})
export class DisenchantLootTemplateComponent extends LootTemplateIdComponent<DisenchantLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: DisenchantLootTemplateService,
    public handlerService: ItemHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
