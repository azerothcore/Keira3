import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LootTemplateComponent } from '@keira/shared/core';
import { ReferenceLootTemplate } from '@keira/shared/acore-world-model';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';
import { ReferenceLootTemplateService } from './reference-loot-template.service';
import { LootEditorComponent } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { TopBarComponent } from '@keira/shared/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-reference-loot-template',
  templateUrl: '../../../../../libs/shared/core/src/abstract/components/editors/loot-template/loot-template.component.html',
  standalone: true,
  imports: [TopBarComponent, NgIf, TranslateModule, LootEditorComponent],
})
export class ReferenceLootTemplateComponent extends LootTemplateComponent<ReferenceLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ReferenceLootTemplateService,
    public handlerService: ReferenceLootHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
