import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '../../shared/single-row-editor.component';
import { ItemTemplate } from '../../../../types/item-template.type';
import { ItemTemplateService } from '../../../../services/editors/item/item-template.service';
import { ItemHandlerService } from '../../../../services/handlers/item-handler.service';
import { ITEM_CLASS, ITEM_SUBCLASS } from '../../../../constants/options/item-class';
import { ITEM_QUALITY } from '../../../../constants/options/item-quality';
import { ITEM_FLAGS } from '../../../../constants/flags/item-flags';
import { ITEM_FLAGS_EXTRA } from '../../../../constants/flags/item-flags-extra';

@Component({
  selector: 'app-item-template',
  templateUrl: './item-template.component.html',
  styleUrls: ['./item-template.component.scss']
})
export class ItemTemplateComponent extends SingleRowEditorComponent<ItemTemplate> {

  public readonly ITEM_CLASS = ITEM_CLASS;
  public readonly ITEM_SUBCLASS = ITEM_SUBCLASS;
  public readonly ITEM_QUALITY = ITEM_QUALITY;
  public readonly ITEM_FLAGS = ITEM_FLAGS;
  public readonly ITEM_FLAGS_EXTRA = ITEM_FLAGS_EXTRA;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ItemTemplateService,
    public handlerService: ItemHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
