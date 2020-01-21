import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '@keira-abstract/components/editors/multi-row-editor.component';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectQuestitem } from '@keira-types/gameobject-questitem.type';
import { GameobjectQuestitemService } from '../gameobject-questitem.service';

@Component({
  selector: 'app-gameobject-questitem',
  templateUrl: './gameobject-questitem.component.html',
  styleUrls: ['./gameobject-questitem.component.scss']
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
