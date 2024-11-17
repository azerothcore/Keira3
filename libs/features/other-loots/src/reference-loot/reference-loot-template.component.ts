import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LootTemplateComponent } from '@keira/shared/base-abstract-classes';
import { ReferenceLootTemplate } from '@keira/shared/acore-world-model';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';
import { ReferenceLootTemplateService } from './reference-loot-template.service';
import { LootEditorComponent } from '@keira/shared/loot-editor';
import { TranslateModule } from '@ngx-translate/core';
import { TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-reference-loot-template',
  templateUrl: '../../../../shared/base-abstract-classes/src/components/editors/loot-template/loot-template.component.html',
  standalone: true,
  imports: [TopBarComponent, TranslateModule, LootEditorComponent],
})
export class ReferenceLootTemplateComponent extends LootTemplateComponent<ReferenceLootTemplate> {
  override readonly editorService = inject(ReferenceLootTemplateService);
  readonly handlerService = inject(ReferenceLootHandlerService);
}
