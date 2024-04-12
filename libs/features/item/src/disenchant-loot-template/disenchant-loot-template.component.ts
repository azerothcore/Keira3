import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LootTemplateIdComponent } from '@keira/shared/base-abstract-classes';
import { DisenchantLootTemplate } from '@keira/shared/acore-world-model';
import { ItemHandlerService } from '../item-handler.service';
import { DisenchantLootTemplateService } from './disenchant-loot-template.service';
import { LootEditorComponent } from '@keira/shared/loot-editor';
import { NgIf } from '@angular/common';
import { TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-disenchant-loot-template',
  templateUrl: '../../../../shared/base-abstract-classes/src/components/editors/loot-template/loot-template-id.component.html',
  standalone: true,
  imports: [TopBarComponent, NgIf, LootEditorComponent],
})
export class DisenchantLootTemplateComponent extends LootTemplateIdComponent<DisenchantLootTemplate> {
  readonly editorService = inject(DisenchantLootTemplateService);
  readonly handlerService = inject(ItemHandlerService);
}
