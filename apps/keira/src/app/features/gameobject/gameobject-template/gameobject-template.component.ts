import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira/shared/core';
import { GAMEOBJECT_ICON, GAMEOBJECT_TYPE, GameobjectTemplate } from '@keira/shared/acore-world-model';
import { FieldDefinition } from '@keira/shared/constants';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectTemplateService } from './gameobject-template.service';
import { VIEWER_TYPE } from '../../model-3d-viewer/model-3d-viewer.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gameobject-template',
  templateUrl: './gameobject-template.component.html',
  styleUrls: ['./gameobject-template.component.scss'],
})
export class GameobjectTemplateComponent extends SingleRowEditorComponent<GameobjectTemplate> {
  readonly GAMEOBJECT_TYPE = GAMEOBJECT_TYPE;
  readonly GAMEOBJECT_ICON = GAMEOBJECT_ICON;
  readonly OBJECT_VIEWER_TYPE = VIEWER_TYPE.OBJECT;

  showItemPreview = true;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: GameobjectTemplateService,
    public handlerService: GameobjectHandlerService,
  ) {
    super(editorService, handlerService);
  }

  dataFieldDefinition(dataIndex: number): FieldDefinition {
    return this.editorService.getFieldDefinition(this.editorService.form.controls.type.value, dataIndex);
  }
}
