import { Component, } from '@angular/core';

import { QueryService } from '../../../../services/query.service';
import { DTCFG } from '../../../../config/datatable.config';
import { ConditionsSearchService } from '../../../../services/search/conditions-search.service';
import { CONDITION_SOURCE_TYPES, CONDITION_SOURCE_TYPES_KEYS } from '../../../../types/conditions.type';

@Component({
  selector: 'app-select-creature',
  templateUrl: './select-conditions.component.html',
  styleUrls: ['./select-conditions.component.scss']
})
export class SelectConditionsComponent {
  public readonly DTCFG = DTCFG;
  public readonly CONDITION_SOURCE_TYPES = CONDITION_SOURCE_TYPES;
  public readonly CONDITION_SOURCE_TYPES_KEYS = CONDITION_SOURCE_TYPES_KEYS;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: ConditionsSearchService,
    public queryService: QueryService,
  ) {
  }

  onSelect(event) {
    console.log(event);
  }
}
