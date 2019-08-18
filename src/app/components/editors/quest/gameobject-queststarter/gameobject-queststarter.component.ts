import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '../../shared/multi-row-editor.component';
import { QuestHandlerService } from '../../../../services/handlers/quest-handler.service';
import { GameobjectQueststarterService } from '../../../../services/editors/quest/gameobject-queststarter.service';
import { GameobjectQueststarter } from '../../../../types/gameobject-queststarter.type';

@Component({
  selector: 'app-gameobject-queststarter',
  templateUrl: './gameobject-queststarter.component.html',
  styleUrls: ['./gameobject-queststarter.component.scss']
})
export class GameobjectQueststarterComponent extends MultiRowEditorComponent<GameobjectQueststarter> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: GameobjectQueststarterService,
    public handlerService: QuestHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
