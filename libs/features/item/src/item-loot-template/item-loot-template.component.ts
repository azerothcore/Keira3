import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ItemLootTemplate } from '@keira/shared/acore-world-model';
import { LootTemplateComponent } from '@keira/shared/base-abstract-classes';
import { TopBarComponent } from '@keira/shared/base-editor-components';
import { LootEditorComponent } from '@keira/shared/loot-editor';
import { ItemHandlerService } from '../item-handler.service';
import { ItemLootTemplateService } from './item-loot-template.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-loot-template',
  templateUrl: '../../../../shared/base-abstract-classes/src/components/editors/loot-template/loot-template.component.html',
  standalone: true,
  imports: [TopBarComponent, LootEditorComponent],
})
export class ItemLootTemplateComponent extends LootTemplateComponent<ItemLootTemplate> {
  protected override readonly editorService = inject(ItemLootTemplateService);
  readonly handlerService = inject(ItemHandlerService);
}
