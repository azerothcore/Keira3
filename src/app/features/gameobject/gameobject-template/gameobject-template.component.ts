import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '@keira-shared/abstract/components/editors/single-row-editor.component';
import { GameobjectTemplate } from '@keira-types/gameobject-template.type';
import { GameobjectTemplateService } from '../gameobject-template.service';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GAMEOBJECT_TYPE } from '@keira-constants/options/gameobject-type';
import { GAMEOBJECT_ICON } from '@keira-constants/options/gameobject-icon';
import { FieldDefinition } from '@keira-types/general';


@Component({
  selector: 'app-gameobject-template',
  templateUrl: './gameobject-template.component.html',
  styleUrls: ['./gameobject-template.component.scss']
})
export class GameobjectTemplateComponent extends SingleRowEditorComponent<GameobjectTemplate> {

  public readonly GAMEOBJECT_TYPE = GAMEOBJECT_TYPE;
  public readonly GAMEOBJECT_ICON = GAMEOBJECT_ICON;
  public readonly GAMEOBJECT_DATA_TOOLTIP = 'Data0-Data23 fields change their meanings according to the selected TYPE. ' +
    'Keira3 will try to reflect their names and show tooltips accordingly whenever the gameobject TYPE is changed';

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
