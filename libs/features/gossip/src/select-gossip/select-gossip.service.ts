import { Service, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { squelConfig } from '@keira/shared/config';
import { MysqlQueryService } from '@keira/shared/db-layer';
import {
  GOSSIP_MENU_ID,
  GOSSIP_MENU_ID_2,
  GOSSIP_MENU_SEARCH_FIELDS,
  GOSSIP_MENU_TABLE,
  GOSSIP_MENU_TEXT_SEARCH_FIELDS,
  GossipMenu,
} from '@keira/shared/acore-world-model';
import { escape } from 'sqlstring';
import squel from 'squel';
import { GossipHandlerService } from '../gossip-handler.service';

/** The gossip menus, searched by their ids and by the texts they show (`npc_text.text0_0` / `text0_1` of their TextID). */
@Service()
export class SelectGossipService extends SelectService<GossipMenu> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(GossipHandlerService);
  protected override readonly entityTable = GOSSIP_MENU_TABLE;
  protected override readonly entityIdField = GOSSIP_MENU_ID;
  protected override entityNameField = null;
  protected override readonly fieldList = [...GOSSIP_MENU_SEARCH_FIELDS, ...GOSSIP_MENU_TEXT_SEARCH_FIELDS] as (keyof GossipMenu &
    string)[];

  constructor() {
    super();
    this.init();
  }

  protected override init(): void {
    super.init();
    this.query = this.searchQuery();
    this.subscriptions.push(this.queryForm.valueChanges.subscribe(() => (this.query = this.searchQuery())));
  }

  /** The menus' own columns as usual, and the texts through `npc_text`. */
  private searchQuery(): string {
    const { limit, fields } = this.queryForm.getRawValue() as { limit: number | null; fields: Record<string, unknown> };
    const filled = (field: string) => fields[field] !== null && fields[field] !== undefined && fields[field] !== '';
    const { exactNumbers, exactNames } = this.editorSettings.search(GOSSIP_MENU_TABLE);
    // (exactly or as a part, as Settings > Editors sets the gossip search)
    const like = (field: string) => {
      const value = String(fields[field]).trim();
      const number = /^-?\d+(\.\d+)?$/.test(value);
      return (number ? exactNumbers : exactNames)
        ? `\`${field}\` = ${escape(number ? value : fields[field])}`
        : `\`${field}\` LIKE ${escape(`%${fields[field]}%`)}`;
    };
    const query = squel.select(squelConfig).from(GOSSIP_MENU_TABLE);
    GOSSIP_MENU_SEARCH_FIELDS.filter(filled).forEach((field) => query.where(like(field)));
    const texts = GOSSIP_MENU_TEXT_SEARCH_FIELDS.filter(filled);
    if (texts.length) {
      query.where(`\`${GOSSIP_MENU_ID_2}\` IN (SELECT \`ID\` FROM \`npc_text\` WHERE ${texts.map(like).join(' AND ')})`);
    }
    if (limit) {
      query.limit(Number(limit));
    }
    return query.toString();
  }
}
