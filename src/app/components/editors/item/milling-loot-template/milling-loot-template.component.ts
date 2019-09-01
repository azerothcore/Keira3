import { Component } from '@angular/core';

import { ItemHandlerService } from '../../../../services/handlers/item-handler.service';
import { MillingLootTemplate } from '../../../../types/milling-loot-template.type';
import { MillingLootTemplateService } from '../../../../services/editors/item/milling-loot-template.service';
import { MultiRowEditorComponent } from '../../shared/multi-row-editor.component';
import { LOOT_MODE } from '../../../../constants/flags/loot-mode';

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
