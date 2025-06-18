import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LootTemplateComponent } from '@keira/shared/base-abstract-classes';
import { MailLootTemplate } from '@keira/shared/acore-world-model';
import { MailLootHandlerService } from './mail-loot-handler.service';
import { MailLootTemplateService } from './mail-loot-template.service';
import { LootEditorComponent } from '@keira/shared/loot-editor';
import { TranslateModule } from '@ngx-translate/core';
import { TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-mail-loot-template',
  templateUrl: '../../../../shared/base-abstract-classes/src/components/editors/loot-template/loot-template.component.html',
  imports: [TopBarComponent, TranslateModule, LootEditorComponent],
})
export class MailLootTemplateComponent extends LootTemplateComponent<MailLootTemplate> {
  protected override readonly editorService = inject(MailLootTemplateService);
  readonly handlerService = inject(MailLootHandlerService);
}
