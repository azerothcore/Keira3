import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { ComplexKeyHandlerService } from '../../abstract/service/handlers/complex-key.handler.service';
import { MysqlQueryService } from '../../services/query/mysql-query.service';
import { SAI_ID_FIELDS, SAI_TABLE, SAI_TYPES, SmartScripts } from '@keira/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class SaiHandlerService extends ComplexKeyHandlerService<SmartScripts> {
  get isSaiUnsaved(): boolean {
    return this.statusMap[SAI_TABLE];
  }

  protected _statusMap = {
    [SAI_TABLE]: false,
  };

  protected _templateQuery: string;
  get templateQuery(): string {
    return this._templateQuery;
  }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
    readonly queryService: MysqlQueryService,
  ) {
    super('smart-ai/editors', router, SAI_ID_FIELDS);
  }

  selectFromEntity(sourceType: number, entryOrGuid: number) {
    // we are selecting an entity, so we don't know if the SAI exists or not
    this.subscriptions.push(
      this.queryService
        .query(`SELECT * FROM smart_scripts WHERE source_type = ${sourceType} AND entryorguid = ${entryOrGuid}`)
        .subscribe((data) => {
          this.select(data.length === 0, { source_type: sourceType, entryorguid: entryOrGuid });
        }),
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
        return (
          `DELETE FROM \`areatrigger_scripts\` WHERE \`entry\` = ${selected.entryorguid};\n` +
          `INSERT INTO \`areatrigger_scripts\` (\`entry\`, \`ScriptName\`) VALUES (${selected.entryorguid}, 'SmartTrigger');`
        );

      default:
        return null;
    }
  }

  getName(): Observable<string> {
    const sai = this.parsedSelected;
    let query: string;

    if (sai.source_type === SAI_TYPES.SAI_TYPE_CREATURE || sai.source_type === SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST) {
      if (sai.entryorguid < 0) {
        query = `SELECT ct.name FROM creature_template AS ct INNER JOIN creature AS c ON c.id1 = ct.entry WHERE c.guid = ${-sai.entryorguid}`;
      } else {
        const entry = sai.source_type === SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST ? Math.trunc(sai.entryorguid / 100) : sai.entryorguid;
        query = `SELECT name FROM creature_template WHERE entry = ${entry}`;
      }
    } else if (sai.source_type === SAI_TYPES.SAI_TYPE_GAMEOBJECT) {
      if (sai.entryorguid < 0) {
        query = `SELECT ct.name FROM gameobject_template AS ct INNER JOIN gameobject AS c ON c.id1 = ct.entry WHERE c.guid = ${-sai.entryorguid}`;
      } else {
        query = `SELECT name FROM gameobject_template WHERE entry = ${sai.entryorguid}`;
      }
    } else {
      console.error(`Unknown source_type`);
      return;
    }

    return this.queryService.query<{ name: string }>(query).pipe(
      map((data) => {
        if (data.length > 0) {
          return `${data[0].name}`;
        } else {
          console.error(`Unable to find name for source_type = ${sai.source_type}, entryorguid = ${sai.entryorguid}`);
          return null;
        }
      }),
    );
  }
}
