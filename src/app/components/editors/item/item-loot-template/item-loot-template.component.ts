import { Component } from '@angular/core';

import { ItemHandlerService } from '../../../../services/handlers/item-handler.service';
import { ItemLootTemplate } from '../../../../types/item-loot-template.type';
import { ItemLootTemplateService } from '../../../../services/editors/item/item-loot-template.service';
import { MultiRowEditorComponent } from '../../shared/multi-row-editor.component';
import { LOOT_MODE } from '../../../../constants/flags/loot-mode';

@Component({
  selector: 'app-item-loot-template',
  templateUrl: './item-loot-template.component.html',
  styleUrls: ['./item-loot-template.component.scss']
})
export class ItemLootTemplateComponent extends MultiRowEditorComponent<ItemLootTemplate> {

  public readonly LOOT_MODE = LOOT_MODE;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ItemLootTemplateService,
    public handlerService: ItemHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
