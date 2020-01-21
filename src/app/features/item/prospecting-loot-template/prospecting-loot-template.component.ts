import { Component } from '@angular/core';

import { ItemHandlerService } from '../item-handler.service';
import { ProspectingLootTemplate } from '@keira-types/prospecting-loot-template.type';
import { ProspectingLootTemplateService } from './prospecting-loot-template.service';
import { MultiRowEditorComponent } from '@keira-abstract/components/editors/multi-row-editor.component';
import { LOOT_MODE } from '@keira-constants/flags/loot-mode';

@Component({
  selector: 'app-prospecting-loot-template',
  templateUrl: '../item-loot-template/item-loot-template.component.html',
  styleUrls: ['../item-loot-template/item-loot-template.component.scss']
})
export class ProspectingLootTemplateComponent extends MultiRowEditorComponent<ProspectingLootTemplate> {

  public readonly LOOT_MODE = LOOT_MODE;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ProspectingLootTemplateService,
    public handlerService: ItemHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
