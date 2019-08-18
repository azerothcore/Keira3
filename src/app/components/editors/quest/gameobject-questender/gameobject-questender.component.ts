import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '../../shared/multi-row-editor.component';
import { QuestHandlerService } from '../../../../services/handlers/quest-handler.service';
import { GameobjectQuestenderService } from '../../../../services/editors/quest/gameobject-questender.service';
import { GameobjectQuestender } from '../../../../types/gameobject-questender.type';

@Component({
  selector: 'app-gameobject-questender',
  templateUrl: './gameobject-questender.component.html',
  styleUrls: ['./gameobject-questender.component.scss']
})
export class GameobjectQuestenderComponent extends MultiRowEditorComponent<GameobjectQuestender> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: GameobjectQuestenderService,
    public handlerService: QuestHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
