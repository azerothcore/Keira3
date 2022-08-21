import { Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira-abstract/components/editors/multi-row-editor.component';
import { GameobjectQuestender } from '@keira-types/gameobject-questender.type';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { GameobjectQuestenderService } from './gameobject-questender.service';

@Component({
  selector: 'keira-gameobject-questender',
  templateUrl: './gameobject-questender.component.html',
  styleUrls: ['./gameobject-questender.component.scss'],
})
export class GameobjectQuestenderComponent extends MultiRowEditorComponent<GameobjectQuestender> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: GameobjectQuestenderService,
    public handlerService: QuestHandlerService,
    readonly questPreviewService: QuestPreviewService,
  ) {
    super(editorService, handlerService);
  }
}
