import { inject, Injectable, signal, Signal } from '@angular/core';
import { map, Observable, of, shareReplay } from 'rxjs';
import { SAI_ID_FIELDS, SAI_TABLE, SAI_TYPES, SmartScripts } from '@keira/shared/acore-world-model';
import { ComplexKeyHandlerService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class SaiHandlerService extends ComplexKeyHandlerService<SmartScripts> {
  protected readonly queryService = inject(MysqlQueryService);
  protected readonly mainEditorRoutePath = 'smart-ai/editors';
  protected readonly idFields = SAI_ID_FIELDS;
  private nameQueryCache = new Map<string, Observable<string>>();

  get isSaiUnsaved(): Signal<boolean> {
    return this.statusMap[SAI_TABLE].asReadonly();
  }

  protected _statusMap = {
    [SAI_TABLE]: signal(false),
  };

  protected _templateQuery!: string;
  get templateQuery(): string {
    return this._templateQuery;
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

  override select(isNew: boolean, id: Partial<SmartScripts>, name: any = null, navigate: boolean = true) {
    super.select(isNew, id, name, navigate);
    this._templateQuery = this.getTemplateQuery() as string;
  }

  protected getTemplateQuery(): string | null {
    const selected: { entryorguid: number; source_type: number } = JSON.parse(this.selected);

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
    const sai = this.parsedSelected as { entryorguid: number; source_type: number };
    const cacheKey = `${sai.source_type}:${sai.entryorguid}`;
    if (this.nameQueryCache.has(cacheKey)) {
      return this.nameQueryCache.get(cacheKey)!;
    }
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
      return of(`Unknown source_type`);
    }
    const observable = this.queryService.query<{ name: string }>(query).pipe(
      map((data) => {
        if (data.length > 0) {
          return `${data[0].name}`;
        } else {
          console.error(`Unable to find name for source_type = ${sai.source_type}, entryorguid = ${sai.entryorguid}`);
          return '';
        }
      }),
      shareReplay(1),
    );
    this.nameQueryCache.set(cacheKey, observable);
    return observable;
  }
}
