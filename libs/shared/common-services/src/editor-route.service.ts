import { inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';

export const TABLE_ROUTE_MAP: Record<string, { route: string; idField: string; nameField?: string }> = {
  creature_template: { route: 'creature/creature-template', idField: 'entry' },
  quest_template: { route: 'quest/quest-template', idField: 'ID' },
  gameobject_template: { route: 'gameobject/gameobject-template', idField: 'entry' },
  item_template: { route: 'item/item-template', idField: 'entry' },
  gossip_menu: { route: 'gossip/gossip-menu', idField: 'MenuID' },
  gossip_menu_option: { route: 'gossip/gossip-menu-option', idField: 'MenuID' },
  spell_dbc: { route: 'spell/spell-dbc', idField: 'ID' },
  trainer: { route: 'trainer/trainer', idField: 'Id' },
  game_tele: { route: 'game-tele/tele', idField: 'id' },
  creature: { route: 'creature/creature-spawn', idField: 'guid' },
  creature_addon: { route: 'creature/creature-spawn-addon', idField: 'guid' },
  creature_template_addon: { route: 'creature/creature-template-addon', idField: 'entry' },
  creature_onkill_reputation: { route: 'creature/creature-onkill-reputation', idField: 'creature_id' },
  creature_equip_template: { route: 'creature/creature-equip-template', idField: 'CreatureID' },
  creature_loot_template: { route: 'creature/creature-loot-template', idField: 'Entry' },
  creature_text: { route: 'creature/creature-text', idField: 'CreatureID' },
  creature_formations: { route: 'creature/creature-formations', idField: 'leaderGUID' },
  npc_vendor: { route: 'creature/npc-vendor', idField: 'entry' },
  creature_questitem: { route: 'creature/creature-questitem', idField: 'Entry' },
  pickpocketing_loot_template: { route: 'creature/pickpocketing-loot-template', idField: 'Entry' },
  skinning_loot_template: { route: 'creature/skinning-loot-template', idField: 'Entry' },
  page_text: { route: 'texts/page-text', idField: 'ID' },
  broadcast_text: { route: 'texts/broadcast-text', idField: 'ID' },
  npc_text: { route: 'texts/npc-text', idField: 'ID' },
  acore_string: { route: 'texts/acore-string', idField: 'entry' },
};

@Injectable({ providedIn: 'root' })
export class EditorRouteService {
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  navigateToEditor(table: string, row: Record<string, unknown>): boolean {
    const entry = TABLE_ROUTE_MAP[table];
    if (!entry) return false;
    const id = row[entry.idField];
    if (id == null) return false;
    this.router.navigate(['/', ...entry.route.split('/')], {
      state: { id: `${id}`, name: entry.nameField ? `${row[entry.nameField] ?? ''}` : undefined },
    });
    return true;
  }
}
