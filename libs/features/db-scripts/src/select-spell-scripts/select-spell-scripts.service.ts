import { inject, Service } from '@angular/core';
import { SPELL_SCRIPTS_ID, SPELL_SCRIPTS_SEARCH_FIELDS, SPELL_SCRIPTS_TABLE, SpellScripts } from '@keira/shared/acore-world-model';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SpellScriptsHandlerService } from '../spell-scripts-handler.service';

/** The spell scripts, one row each: how many steps, which commands. */
@Service()
export class SelectSpellScriptsService extends SelectService<SpellScripts> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(SpellScriptsHandlerService);
  protected override readonly entityTable = SPELL_SCRIPTS_TABLE;
  protected override readonly entityIdField = SPELL_SCRIPTS_ID;
  protected override entityNameField = null;
  protected override readonly fieldList = SPELL_SCRIPTS_SEARCH_FIELDS as (keyof SpellScripts & string)[];
  protected override readonly selectFields = [
    'id',
    '(COUNT(*)) AS `steps`',
    '(GROUP_CONCAT(DISTINCT `command` ORDER BY `command`)) AS `commands`',
  ];
  protected override readonly groupFields = ['id'];

  constructor() {
    super();
    this.init();
  }
}
