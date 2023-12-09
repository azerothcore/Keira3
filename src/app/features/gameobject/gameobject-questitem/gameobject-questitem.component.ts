import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira-abstract/components/editors/multi-row-editor.component';
import { GameobjectQuestitem } from '@keira-types/gameobject-questitem.type';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectQuestitemService } from './gameobject-questitem.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-gameobject-questitem',
  templateUrl: './gameobject-questitem.component.html',
  styleUrls: ['./gameobject-questitem.component.scss'],
})
export class GameobjectQuestitemComponent extends MultiRowEditorComponent<GameobjectQuestitem> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: GameobjectQuestitemService, public handlerService: GameobjectHandlerService) {
    super(editorService, handlerService);
  }
}
