import { Component, } from '@angular/core';

import { SelectComponent } from '@keira-abstract/components/editors/select.component';
import {
  GAMEOBJECT_TEMPLATE_CUSTOM_STARTING_ID,
  GAMEOBJECT_TEMPLATE_ID,
  GAMEOBJECT_TEMPLATE_TABLE,
  GameobjectTemplate
} from '@keira-types/gameobject-template.type';
import { SelectGameobjectService } from './select-gameobject.service';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';

@Component({
  selector: 'keira-select-gameobject',
  templateUrl: './select-gameobject.component.html',
  styleUrls: ['./select-gameobject.component.scss']
})
export class SelectGameobjectComponent extends SelectComponent<GameobjectTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: SelectGameobjectService,
    public handlerService: GameobjectHandlerService,
    public queryService: MysqlQueryService,
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
