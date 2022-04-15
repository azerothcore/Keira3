import { Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira-abstract/components/editors/multi-row-editor.component';
import { GameobjectQueststarter } from '@keira-types/gameobject-queststarter.type';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { GameobjectQueststarterService } from './gameobject-queststarter.service';

@Component({
  selector: 'keira-gameobject-queststarter',
  templateUrl: './gameobject-queststarter.component.html',
  styleUrls: ['./gameobject-queststarter.component.scss'],
})
export class GameobjectQueststarterComponent extends MultiRowEditorComponent<GameobjectQueststarter> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: GameobjectQueststarterService,
    public handlerService: QuestHandlerService,
    public readonly questPreviewService: QuestPreviewService,
  ) {
    super(editorService, handlerService);
  }
}
