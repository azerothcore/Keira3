import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SaiEditorComponent } from '@keira-shared/modules/sai-editor/sai-editor.component';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { SaiGameobjectEditorService } from './sai-gameobject-editor.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sai-gameobject',
  templateUrl: '../../../shared/modules/sai-editor/sai-editor.component.html',
  styleUrls: ['../../../shared/modules/sai-editor/sai-editor.component.scss'],
})
export class SaiGameobjectComponent extends SaiEditorComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: SaiGameobjectEditorService,
    protected handlerService: SaiGameobjectHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
