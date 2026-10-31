import { computed, inject, Injectable } from '@angular/core';
import { ElectronService } from './electron.service';
import { ServerSettingsService } from './server-settings.service';
import { SOAP_TRANSPORT } from './soap-transport';

/** The tables the worldserver's `.reload` reads again (cs_reload.cpp), by their own name. */
export const RELOADABLE_TABLES = new Set(
  (
    'achievement_criteria_data achievement_reward areatrigger areatrigger_involvedrelation areatrigger_tavern areatrigger_teleport ' +
    'autobroadcast broadcast_text battleground_template conditions creature_text creature_questender creature_linked_respawn ' +
    'creature_loot_template creature_movement_override creature_onkill_reputation creature_queststarter disables ' +
    'disenchant_loot_template event_scripts fishing_loot_template game_graveyard graveyard_zone game_tele gameobject_questender ' +
    'gameobject_loot_template gameobject_queststarter gossip_menu gossip_menu_option item_enchantment_template item_loot_template ' +
    'item_set_names lfg_dungeon_rewards achievement_reward_locale creature_template_locale creature_text_locale ' +
    'gameobject_template_locale gossip_menu_option_locale item_template_locale item_set_name_locale npc_text_locale ' +
    'page_text_locale points_of_interest_locale quest_template_locale quest_offer_reward_locale quest_request_item_locale ' +
    'mail_level_reward mail_loot_template milling_loot_template npc_spellclick_spells trainer npc_vendor game_event_npc_vendor ' +
    'page_text pickpocketing_loot_template points_of_interest prospecting_loot_template quest_greeting quest_poi quest_template ' +
    'reference_loot_template reputation_reward_rate reputation_spillover_template skill_discovery_template ' +
    'skill_extra_item_template skill_fishing_base_level skinning_loot_template smart_scripts spell_required spell_area ' +
    'spell_bonus_data spell_group spell_loot_template spell_linked_spell spell_pet_auras spell_proc spell_scripts ' +
    'spell_target_position spell_threats spell_group_stack_rules player_loot_template acore_string waypoint_scripts ' +
    'waypoint_data vehicle_accessory vehicle_template_accessory'
  ).split(' '),
);

/** The `.reload` for a table and the entity edited (creature_template reloads one entry), or undefined. */
export function reloadCommand(table: string, entity: string): string | undefined {
  if (table === 'creature_template' && /^\d+$/.test(entity)) {
    return `reload creature_template ${entity}`;
  }
  return RELOADABLE_TABLES.has(table) ? `reload ${table}` : undefined;
}

const escapeXml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const unescapeXml = (text: string): string =>
  text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');

/**
 * GM commands to the running worldserver through its SOAP (worldserver.conf: SOAP.Enabled = 1, with a GM account of
 * the console's level): `.reload` after an edit, `server info`… Only in the desktop app.
 */
@Injectable({ providedIn: 'root' })
export class SoapService {
  private readonly server = inject(ServerSettingsService);
  private readonly electron = inject(ElectronService);
  private readonly transport = inject(SOAP_TRANSPORT);
  /** Whether commands can be sent (SOAP on in Settings, in the desktop app). */
  readonly available = computed(() => this.server.settings().soapEnabled && !!this.electron.isElectron());

  /** Runs a command (without its leading dot) and gives what the server answered; fails with the server's message. */
  async execute(command: string): Promise<string> {
    const { soapHost, soapPort, soapUser, soapPassword } = this.server.settings();
    const body =
      '<?xml version="1.0" encoding="utf-8"?>' +
      '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="urn:AC">' +
      `<SOAP-ENV:Body><ns1:executeCommand><command>${escapeXml(command.trim().replace(/^\./, ''))}</command></ns1:executeCommand>` +
      '</SOAP-ENV:Body></SOAP-ENV:Envelope>';
    const answer = await this.transport({ host: soapHost, port: soapPort, auth: `${soapUser}:${soapPassword}`, body });
    if (answer.status === 401) {
      throw new Error('The SOAP account was refused (it needs the GM level SOAP asks for).');
    }
    const fault = /<faultstring>([\s\S]*?)<\/faultstring>/.exec(answer.body);
    if (fault || answer.status !== 200) {
      throw new Error(unescapeXml(fault?.[1] ?? `HTTP ${answer.status}`).trim());
    }
    return unescapeXml(/<result>([\s\S]*?)<\/result>/.exec(answer.body)?.[1] ?? '').trim();
  }
}
