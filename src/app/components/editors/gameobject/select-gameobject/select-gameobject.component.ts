import { Component, } from '@angular/core';

import { SelectComponent } from '../../shared/select.component';
import {
  GAMEOBJECT_TEMPLATE_CUSTOM_STARTING_ID,
  GAMEOBJECT_TEMPLATE_ID,
  GAMEOBJECT_TEMPLATE_TABLE,
  GameobjectTemplate
} from '../../../../types/gameobject-template.type';
import { GameobjectSelectService } from '../../../../services/select/gameobject-select.service';
import { GameobjectHandlerService } from '../../../../services/handlers/gameobject-handler.service';
import { QueryService } from '../../../../services/query.service';

@Component({
  selector: 'app-select-gameobject',
  templateUrl: './select-gameobject.component.html',
  styleUrls: ['./select-gameobject.component.scss']
})
export class SelectGameobjectComponent extends SelectComponent<GameobjectTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: GameobjectSelectService,
    public handlerService: GameobjectHandlerService,
    public queryService: QueryService,
  ) {
    super(
      GAMEOBJECT_TEMPLATE_TABLE,
      GAMEOBJECT_TEMPLATE_ID,
      GAMEOBJECT_TEMPLATE_CUSTOM_STARTING_ID,
      selectService,
      handlerService,
      queryService,
    );
  }
}
