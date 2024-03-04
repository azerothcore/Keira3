import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LootTemplateIdComponent } from '@keira/core';
import { CreatureLootTemplate } from '@keira/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureLootTemplateService } from './creature-loot-template.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-loot-template',
  templateUrl: '../../../../../../../libs/keira-core/src/abstract/components/editors/loot-template/loot-template-id.component.html',
})
export class CreatureLootTemplateComponent extends LootTemplateIdComponent<CreatureLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureLootTemplateService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
