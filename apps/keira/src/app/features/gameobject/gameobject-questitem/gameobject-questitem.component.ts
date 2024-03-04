import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira/core';
import { GameobjectQuestitem } from '@keira/acore-world-model';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectQuestitemService } from './gameobject-questitem.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gameobject-questitem',
  templateUrl: './gameobject-questitem.component.html',
  styleUrls: ['./gameobject-questitem.component.scss'],
})
export class GameobjectQuestitemComponent extends MultiRowEditorComponent<GameobjectQuestitem> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: GameobjectQuestitemService,
    public handlerService: GameobjectHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
