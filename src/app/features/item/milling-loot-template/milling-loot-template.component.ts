import { Component } from '@angular/core';

import { ItemHandlerService } from '../item-handler.service';
import { MillingLootTemplate } from '@keira-types/milling-loot-template.type';
import { MillingLootTemplateService } from './milling-loot-template.service';
import { MultiRowEditorComponent } from '@keira-abstract/components/editors/multi-row-editor.component';
import { LOOT_MODE } from '@keira-constants/flags/loot-mode';

@Component({
  selector: 'app-milling-loot-template',
  templateUrl: '../item-loot-template/item-loot-template.component.html',
  styleUrls: ['../item-loot-template/item-loot-template.component.scss']
})
export class MillingLootTemplateComponent extends MultiRowEditorComponent<MillingLootTemplate> {

  public readonly LOOT_MODE = LOOT_MODE;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: MillingLootTemplateService,
    public handlerService: ItemHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
