import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '../../shared/multi-row-editor.component';
import { ItemHandlerService } from '../../../../services/handlers/item-handler.service';
import { ItemEnchantmentTemplate } from '../../../../types/item-enchantment-template.type';
import { ItemEnchantmentTemplateService } from '../../../../services/editors/item/item-enchantment-template.service';

@Component({
  selector: 'app-item-enchantment-template',
  templateUrl: './item-enchantment-template.component.html',
  styleUrls: ['./item-enchantment-template.component.scss']
})
export class ItemEnchantmentTemplateComponent extends MultiRowEditorComponent<ItemEnchantmentTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ItemEnchantmentTemplateService,
    public handlerService: ItemHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
