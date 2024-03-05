import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LootTemplateComponent } from '@keira/shared/core';
import { ReferenceLootTemplate } from '@keira/shared/acore-world-model';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';
import { ReferenceLootTemplateService } from './reference-loot-template.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-reference-loot-template',
  templateUrl: '../../../../../../../libs/shared/core/src/abstract/components/editors/loot-template/loot-template.component.html',
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
