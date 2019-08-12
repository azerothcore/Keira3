import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '../../shared/single-row-editor.component';
import { GameobjectTemplate } from '../../../../types/gameobject-template.type';
import { GameobjectTemplateService } from '../../../../services/editors/gameobject/gameobject-template.service';
import { GameobjectHandlerService } from '../../../../services/handlers/gameobject-handler.service';
import { GAMEOBJECT_TYPE } from '../../../../constants/options/gameobject-type';
import { GAMEOBJECT_ICON } from '../../../../constants/options/gameobject-icon';
import { FieldDefinition } from '../../../../types/general';


@Component({
  selector: 'app-gameobject-template',
  templateUrl: './gameobject-template.component.html',
  styleUrls: ['./gameobject-template.component.scss']
})
export class GameobjectTemplateComponent extends SingleRowEditorComponent<GameobjectTemplate> {

  public readonly GAMEOBJECT_TYPE = GAMEOBJECT_TYPE;
  public readonly GAMEOBJECT_ICON = GAMEOBJECT_ICON;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: GameobjectTemplateService,
    public handlerService: GameobjectHandlerService,
  ) {
    super(editorService, handlerService);
  }

  dataFieldDefinition(dataIndex: number): FieldDefinition {
    return this.editorService.getFieldDefinition(this.editorService.form.get('type').value, dataIndex);
  }
}
