import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira-abstract/components/editors/multi-row-editor.component';
import { ItemEnchantmentTemplate } from '@keira-types/item-enchantment-template.type';
import { ItemHandlerService } from '../item-handler.service';
import { ItemEnchantmentTemplateService } from './item-enchantment-template.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
  selector: 'keira-item-enchantment-template',
  templateUrl: './item-enchantment-template.component.html',
  styleUrls: ['./item-enchantment-template.component.scss'],
})
export class ItemEnchantmentTemplateComponent extends MultiRowEditorComponent<ItemEnchantmentTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: ItemEnchantmentTemplateService, public handlerService: ItemHandlerService) {
    super(editorService, handlerService);
  }
}
