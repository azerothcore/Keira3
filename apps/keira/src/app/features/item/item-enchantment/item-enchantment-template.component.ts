import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira/core';
import { ItemEnchantmentTemplate } from '@keira/acore-world-model';
import { ItemHandlerService } from '../item-handler.service';
import { ItemEnchantmentTemplateService } from './item-enchantment-template.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-enchantment-template',
  templateUrl: './item-enchantment-template.component.html',
  styleUrls: ['./item-enchantment-template.component.scss'],
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
