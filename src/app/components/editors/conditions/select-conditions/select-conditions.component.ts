import { Component, } from '@angular/core';

import { QueryService } from '../../../../services/query.service';
import { DTCFG } from '../../../../config/datatable.config';
import { ConditionsSearchService } from '../../../../services/search/conditions-search.service';
import { CONDITION_SOURCE_TYPES, CONDITION_SOURCE_TYPES_KEYS } from '../../../../types/conditions.type';
import { WIKI_BASE_URL } from '../../../../constants/general';
import { ConditionsHandlerService } from '../../../../services/handlers/conditions-handler.service';

@Component({
  selector: 'app-select-creature',
  templateUrl: './select-conditions.component.html',
  styleUrls: ['./select-conditions.component.scss']
})
export class SelectConditionsComponent {
  public readonly DTCFG = DTCFG;
  public readonly WIKI_BASE_URL = WIKI_BASE_URL;
  public readonly CONDITION_SOURCE_TYPES = CONDITION_SOURCE_TYPES;
  public readonly CONDITION_SOURCE_TYPES_KEYS = CONDITION_SOURCE_TYPES_KEYS;

  constructor(
    public selectService: ConditionsSearchService,
    private handlerService: ConditionsHandlerService,
  ) {}

  onSelect(event) {
    this.handlerService.selected = event.selected[0];
    this.handlerService.isNew = false;
    console.log(this.handlerService.selected);
  }

  onCreateNew() {
    this.handlerService.selected = this.selectService.fields.getRawValue();
    this.handlerService.isNew = true;
    console.log(this.handlerService.selected);
  }
}
