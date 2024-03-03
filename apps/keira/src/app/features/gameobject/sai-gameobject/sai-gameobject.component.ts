import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SaiEditorComponent } from '@keira/core';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { SaiGameobjectEditorService } from './sai-gameobject-editor.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sai-gameobject',
  templateUrl: '../../../../../../../libs/keira-core/src/modules/sai-editor/sai-editor.component.html',
  styleUrls: ['../../../../../../../libs/keira-core/src/modules/sai-editor/sai-editor.component.scss'],
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
