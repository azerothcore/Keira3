import { Service, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { LOOT_TEMPLATE_ID, REFERENCE_LOOT_TEMPLATE_TABLE, ReferenceLootTemplate } from '@keira/shared/acore-world-model';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';

@Service()
export class SelectReferenceLootService extends SelectService<ReferenceLootTemplate> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(ReferenceLootHandlerService);
  protected override readonly entityTable = REFERENCE_LOOT_TEMPLATE_TABLE;
  protected override readonly entityIdField = LOOT_TEMPLATE_ID;
  protected override entityNameField = null;
  protected override readonly fieldList = [LOOT_TEMPLATE_ID];
  protected override readonly selectFields = [
    LOOT_TEMPLATE_ID,
    // (its rows and groups, named so: `rows` and `groups` are MySQL 8 keywords)
    '(COUNT(*)) AS `items`',
    '(COUNT(DISTINCT `GroupId`)) AS `lootGroups`',
    // (the loot tables using it as a reference)
    '(' +
      '(SELECT COUNT(*) FROM `creature_loot_template` WHERE `Reference` = `reference_loot_template`.`Entry`) + ' +
      '(SELECT COUNT(*) FROM `gameobject_loot_template` WHERE `Reference` = `reference_loot_template`.`Entry`) + ' +
      '(SELECT COUNT(*) FROM `item_loot_template` WHERE `Reference` = `reference_loot_template`.`Entry`) + ' +
      '(SELECT COUNT(*) FROM `pickpocketing_loot_template` WHERE `Reference` = `reference_loot_template`.`Entry`) + ' +
      '(SELECT COUNT(*) FROM `skinning_loot_template` WHERE `Reference` = `reference_loot_template`.`Entry`) + ' +
      '(SELECT COUNT(*) FROM `disenchant_loot_template` WHERE `Reference` = `reference_loot_template`.`Entry`) + ' +
      '(SELECT COUNT(*) FROM `prospecting_loot_template` WHERE `Reference` = `reference_loot_template`.`Entry`) + ' +
      '(SELECT COUNT(*) FROM `milling_loot_template` WHERE `Reference` = `reference_loot_template`.`Entry`) + ' +
      '(SELECT COUNT(*) FROM `fishing_loot_template` WHERE `Reference` = `reference_loot_template`.`Entry`) + ' +
      '(SELECT COUNT(*) FROM `mail_loot_template` WHERE `Reference` = `reference_loot_template`.`Entry`) + ' +
      '(SELECT COUNT(*) FROM `spell_loot_template` WHERE `Reference` = `reference_loot_template`.`Entry`) + ' +
      '(SELECT COUNT(*) FROM `reference_loot_template` `r` WHERE `r`.`Reference` = `reference_loot_template`.`Entry`)' +
      ') AS `usedBy`',
  ];
  protected override readonly groupFields = [LOOT_TEMPLATE_ID];
  constructor() {
    super();
    this.init();
  }
}
