import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { ComplexKeyHandlerService } from './complex-key.handler.service';
import { SAI_ID_FIELDS, SAI_TYPES, SmartScripts } from '../../types/smart-scripts.type';
import { QueryService } from '../query.service';

@Injectable({
  providedIn: 'root'
})
export class SaiHandlerService extends ComplexKeyHandlerService<SmartScripts> {

  protected _templateQuery: string;
  get templateQuery(): string {
    return this._templateQuery;
  }

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

  select(isNew: boolean, id: Partial<SmartScripts>, name: any = null, navigate: boolean = true) {
    super.select(isNew, id, name, navigate);
    this._templateQuery = this.getTemplateQuery();
  }

  protected getTemplateQuery(): string {
    const selected: Partial<SmartScripts> = JSON.parse(this.selected);

    if (selected.entryorguid < 0) {
      // TODO: add support for GUIDs, if needed
      return null;
    }

    switch (selected.source_type) {

      case SAI_TYPES.SAI_TYPE_CREATURE:
        return `UPDATE \`creature_template\` SET \`AIName\` = 'SmartAI' WHERE \`entry\` = ${selected.entryorguid};`;

      case SAI_TYPES.SAI_TYPE_GAMEOBJECT:
        return `UPDATE \`gameobject_template\` SET \`AIName\` = 'SmartGameObjectAI' WHERE \`entry\` = ${selected.entryorguid};`;

      case SAI_TYPES.SAI_TYPE_AREATRIGGER:
        return `DELETE FROM \`areatrigger_scripts\` WHERE \`entry\` = ${selected.entryorguid};\n` +
          `INSERT INTO \`areatrigger_scripts\` (\`entry\`, \`ScriptName\`) VALUES (${selected.entryorguid}, 'SmartTrigger');`;

      default:
        return null;
    }
  }
}
