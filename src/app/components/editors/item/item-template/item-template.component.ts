import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '../../shared/single-row-editor.component';
import { ItemTemplate } from '../../../../types/item-template.type';
import { ItemTemplateService } from '../../../../services/editors/item/item-template.service';
import { ItemHandlerService } from '../../../../services/handlers/item-handler.service';

@Component({
  selector: 'app-item-template',
  templateUrl: './item-template.component.html',
  styleUrls: ['./item-template.component.scss']
})
export class ItemTemplateComponent extends SingleRowEditorComponent<ItemTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ItemTemplateService,
    public handlerService: ItemHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
