import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LootTemplateComponent } from '@keira/shared/core';
import { ItemLootTemplate } from '@keira/shared/acore-world-model';
import { ItemHandlerService } from '../item-handler.service';
import { ItemLootTemplateService } from './item-loot-template.service';
import { LootEditorComponent } from '@keira/shared/core';
import { NgIf } from '@angular/common';
import { TopBarComponent } from '@keira/shared/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-loot-template',
  templateUrl: '../../../../../../../libs/shared/core/src/abstract/components/editors/loot-template/loot-template.component.html',
  standalone: true,
  imports: [TopBarComponent, NgIf, LootEditorComponent],
})
export class ItemLootTemplateComponent extends LootTemplateComponent<ItemLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ItemLootTemplateService,
    public handlerService: ItemHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
