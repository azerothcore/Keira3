import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LootTemplateComponent } from '@keira/shared/base-abstract-classes';
import { ProspectingLootTemplate } from '@keira/shared/acore-world-model';
import { ItemHandlerService } from '../item-handler.service';
import { ProspectingLootTemplateService } from './prospecting-loot-template.service';
import { LootEditorComponent } from '@keira/shared/loot-editor';
import { TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-prospecting-loot-template',
  templateUrl: '../../../../shared/base-abstract-classes/src/components/editors/loot-template/loot-template.component.html',
  imports: [TopBarComponent, LootEditorComponent],
})
export class ProspectingLootTemplateComponent extends LootTemplateComponent<ProspectingLootTemplate> {
  protected override readonly editorService = inject(ProspectingLootTemplateService);
  readonly handlerService = inject(ItemHandlerService);
}
