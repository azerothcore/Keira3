import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '../../../shared/abstract/components/editors/multi-row-editor.component';
import { ItemHandlerService } from '../item-handler.service';
import { ItemEnchantmentTemplate } from '../../../shared/types/item-enchantment-template.type';
import { ItemEnchantmentTemplateService } from '../item-enchantment-template.service';

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
