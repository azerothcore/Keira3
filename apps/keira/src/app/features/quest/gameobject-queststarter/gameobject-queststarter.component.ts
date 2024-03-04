import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira/core';
import { GameobjectQueststarter } from '@keira/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { GameobjectQueststarterService } from './gameobject-queststarter.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gameobject-queststarter',
  templateUrl: './gameobject-queststarter.component.html',
  styleUrls: ['./gameobject-queststarter.component.scss'],
})
export class GameobjectQueststarterComponent extends MultiRowEditorComponent<GameobjectQueststarter> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: GameobjectQueststarterService,
    public handlerService: QuestHandlerService,
    readonly questPreviewService: QuestPreviewService,
  ) {
    super(editorService, handlerService);
  }
}
