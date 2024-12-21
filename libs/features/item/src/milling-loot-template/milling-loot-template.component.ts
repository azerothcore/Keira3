import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LootTemplateComponent } from '@keira/shared/base-abstract-classes';
import { MillingLootTemplate } from '@keira/shared/acore-world-model';
import { ItemHandlerService } from '../item-handler.service';
import { MillingLootTemplateService } from './milling-loot-template.service';
import { LootEditorComponent } from '@keira/shared/loot-editor';
import { TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-milling-loot-template',
  templateUrl: '../../../../shared/base-abstract-classes/src/components/editors/loot-template/loot-template.component.html',
  standalone: true,
  imports: [TopBarComponent, LootEditorComponent],
})
export class MillingLootTemplateComponent extends LootTemplateComponent<MillingLootTemplate> {
  protected override readonly editorService = inject(MillingLootTemplateService);
  readonly handlerService = inject(ItemHandlerService);
}
