import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LootTemplateComponent } from '@keira/shared/core';
import { SpellLootTemplate } from '@keira/shared/acore-world-model';
import { SpellLootHandlerService } from './spell-loot-handler.service';
import { SpellLootTemplateService } from './spell-loot-template.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { TopBarComponent } from '@keira/shared/base-editor-components';
import { LootEditorComponent } from '@keira/shared/loot-editor';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-loot-template',
  templateUrl: '../../../../../libs/shared/core/src/abstract/components/editors/loot-template/loot-template.component.html',
  standalone: true,
  imports: [TopBarComponent, NgIf, TranslateModule, LootEditorComponent],
})
export class SpellLootTemplateComponent extends LootTemplateComponent<SpellLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: SpellLootTemplateService,
    public handlerService: SpellLootHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
