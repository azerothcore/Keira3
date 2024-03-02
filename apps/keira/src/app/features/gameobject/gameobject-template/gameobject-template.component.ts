import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { GAMEOBJECT_ICON } from '@keira-constants/options/gameobject-icon';
import { GAMEOBJECT_TYPE } from '@keira-constants/options/gameobject-type';
import { GameobjectTemplate } from '@keira/acore-world-model';
import { FieldDefinition } from '@keira/acore-world-model';
import { VIEWER_TYPE } from 'app/features/model-3d-viewer/model-3d-viewer.model';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectTemplateService } from './gameobject-template.service';

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
