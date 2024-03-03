import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SaiEditorComponent } from '@keira/core';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { SaiCreatureEditorService } from './sai-creature-editor.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sai-creature',
  templateUrl: '../../../../../../../libs/keira-core/src/modules/sai-editor/sai-editor.component.html',
  styleUrls: ['../../../../../../../libs/keira-core/src/modules/sai-editor/sai-editor.component.scss'],
})
export class SaiCreatureComponent extends SaiEditorComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: SaiCreatureEditorService,
    protected handlerService: SaiCreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
