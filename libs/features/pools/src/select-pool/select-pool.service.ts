import { inject, Service } from '@angular/core';
import {
  POOL_TEMPLATE_ID,
  POOL_TEMPLATE_NAME,
  POOL_TEMPLATE_SEARCH_FIELDS,
  POOL_TEMPLATE_TABLE,
  PoolTemplate,
} from '@keira/shared/acore-world-model';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { PoolHandlerService } from '../pool-handler.service';

/** The tables counted for each pool: table, the column naming the pool, the column shown. */
const POOL_COUNT_COLUMNS: [string, string, string][] = [
  ['pool_creature', 'pool_entry', 'creatures'],
  ['pool_gameobject', 'pool_entry', 'gameobjects'],
  ['pool_pool', 'mother_pool', 'pools'],
  ['pool_quest', 'pool_entry', 'quests'],
];

/** The pools of `pool_template`. */
@Service()
export class SelectPoolService extends SelectService<PoolTemplate> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(PoolHandlerService);
  protected override readonly entityTable = POOL_TEMPLATE_TABLE;
  protected override readonly entityIdField = POOL_TEMPLATE_ID;
  protected override entityNameField = POOL_TEMPLATE_NAME;
  protected override readonly fieldList = POOL_TEMPLATE_SEARCH_FIELDS as (keyof PoolTemplate & string)[];
  /** What each pool holds, its mother pool and its game event, as columns. */
  protected override readonly selectFields = [
    'entry',
    'max_limit',
    'description',
    ...POOL_COUNT_COLUMNS.map(
      ([table, key, alias]) =>
        `(SELECT COUNT(*) FROM \`${table}\` WHERE \`${key}\` = \`${POOL_TEMPLATE_TABLE}\`.\`entry\`) AS \`${alias}\``,
    ),
    `(SELECT MIN(\`mother_pool\`) FROM \`pool_pool\` WHERE \`pool_id\` = \`${POOL_TEMPLATE_TABLE}\`.\`entry\`) AS \`mother\``,
    `(SELECT MIN(\`eventEntry\`) FROM \`game_event_pool\` WHERE \`pool_entry\` = \`${POOL_TEMPLATE_TABLE}\`.\`entry\`) AS \`event\``,
  ];

  constructor() {
    super();
    this.init();
  }
}
