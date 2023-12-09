import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SaiEditorComponent } from '@keira-shared/modules/sai-editor/sai-editor.component';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { SaiCreatureEditorService } from './sai-creature-editor.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-sai-creature',
  templateUrl: '../../../shared/modules/sai-editor/sai-editor.component.html',
  styleUrls: ['../../../shared/modules/sai-editor/sai-editor.component.scss'],
})
export class SaiCreatureComponent extends SaiEditorComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: SaiCreatureEditorService, protected handlerService: SaiCreatureHandlerService) {
    super(editorService, handlerService);
  }
}
