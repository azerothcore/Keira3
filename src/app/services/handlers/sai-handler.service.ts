import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { ComplexKeyHandlerService } from './complex-key.handler.service';
import { SAI_ID_FIELDS, SmartScripts } from '../../types/smart-scripts.type';
import { QueryService } from '../query.service';

@Injectable({
  providedIn: 'root'
})
export class SaiHandlerService extends ComplexKeyHandlerService<SmartScripts> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
    protected queryService: QueryService,
  ) {
    super(
      'smart-ai/editor',
      router,
      SAI_ID_FIELDS,
    );
  }

  selectFromEntity(sourceType: number, entryOrGuid: number) {
    // we are selecting an entity, so we don't know if the SAI exists or not
    this.subscriptions.push(
      this.queryService.query(
        `SELECT * FROM smart_scripts WHERE source_type = ${sourceType} AND entryorguid = ${entryOrGuid}`
      ).subscribe((data) => {
        this.select(data.results.length === 0, { source_type: sourceType, entryorguid: entryOrGuid });
      })
    );
  }
}
