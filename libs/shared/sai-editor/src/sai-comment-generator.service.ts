import { Injectable } from '@angular/core';
import { SAI_TYPES, SmartScripts } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteQueryService } from '@keira/shared/db-layer';
import { SAI_ACTION_COMMENTS, SAI_EVENT_COMMENTS } from './constants/sai-comments';
import {
  DYNAMIC_FLAGS,
  EVENT_FLAGS,
  GO_FLAGS,
  NPC_FLAGS,
  phaseMask,
  templates,
  UNIT_FLAGS,
  unitBytes1Flags,
  unitFieldBytes1Type,
  unitStandFlags,
  unitStandStateType,
} from './constants/sai-constants';
import { SAI_EVENTS } from './constants/sai-event';
import { SAI_TARGETS } from './constants/sai-targets';

@Injectable({
  providedIn: 'root',
})
export class SaiCommentGeneratorService {
  constructor(
    private queryService: MysqlQueryService,
    private sqliteQueryService: SqliteQueryService,
  ) {}

  private async getStringByTargetType(smartScript: SmartScripts): Promise<string> {
    switch (Number(smartScript.target_type)) {
      case SAI_TARGETS.SELF:
        return 'Self';
      case SAI_TARGETS.VICTIM:
        return 'Victim';
      case SAI_TARGETS.HOSTILE_SECOND_AGGRO:
        return 'Second On Threatlist';
      case SAI_TARGETS.HOSTILE_LAST_AGGRO:
        return 'Last On Threatlist';
      case SAI_TARGETS.HOSTILE_RANDOM:
        return 'Random On Threatlist';
      case SAI_TARGETS.HOSTILE_RANDOM_NOT_TOP:
        return 'Random On Threatlist Not Top';
      case SAI_TARGETS.ACTION_INVOKER:
        return 'Invoker';
      case SAI_TARGETS.POSITION:
        return 'Position';
      case SAI_TARGETS.CREATURE_RANGE:
      case SAI_TARGETS.CREATURE_DISTANCE:
      case SAI_TARGETS.CLOSEST_CREATURE:
        return `Closest Creature '${await this.queryService.getCreatureNameById(smartScript.target_param1)}'`;
      case SAI_TARGETS.STORED:
        return 'Stored';
      case SAI_TARGETS.CREATURE_GUID:
        return `Closest Creature '${await this.queryService.getCreatureNameByGuid(smartScript.target_param1)}'`;
      case SAI_TARGETS.GAMEOBJECT_RANGE:
      case SAI_TARGETS.GAMEOBJECT_DISTANCE:
      case SAI_TARGETS.CLOSEST_GAMEOBJECT:
        return `Closest Creature '${await this.queryService.getGameObjectNameById(smartScript.target_param1)}'`;
      case SAI_TARGETS.GAMEOBJECT_GUID:
        return `Closest Creature '${await this.queryService.getGameObjectNameByGuid(smartScript.target_param1)}'`;
      case SAI_TARGETS.INVOKER_PARTY:
        return "Invoker's Party";
      case SAI_TARGETS.PLAYER_RANGE:
        return 'Players in Range';
      case SAI_TARGETS.PLAYER_DISTANCE:
        return 'Players in Distance';
      case SAI_TARGETS.CLOSEST_PLAYER:
        return 'Closest Player';
      case SAI_TARGETS.ACTION_INVOKER_VEHICLE:
        return `Invoker's Vehicle`;
      case SAI_TARGETS.OWNER_OR_SUMMONER:
        return 'Owner Or Summoner';
      case SAI_TARGETS.THREAT_LIST:
        return 'Threatlist';
      case SAI_TARGETS.CLOSEST_ENEMY:
        return 'Closest Enemy';
      case SAI_TARGETS.CLOSEST_FRIENDLY:
        return 'Closest Friendly Unit';
      case SAI_TARGETS.LOOT_RECIPIENTS:
        return 'Loot Recipients';
      case SAI_TARGETS.FARTHEST:
        return 'Farthest Target';
      case SAI_TARGETS.VEHICLE_PASSENGER:
        return 'Vehicle Seat';
      case SAI_TARGETS.PLAYER_WITH_AURA:
        return 'Player With Aura';
      case SAI_TARGETS.RANDOM_POINT:
        return 'Random Point';
      case SAI_TARGETS.ROLE_SELECTION:
        return 'Class Roles';
      case SAI_TARGETS.SUMMONED_CREATURES:
        return 'Summoned Creatures';
      case SAI_TARGETS.INSTANCE_STORAGE:
        return 'Instance Storage';
      default:
        return '[unsupported target type]';
    }
  }

  /* Get previous script of links chain */
  private getPreviousScriptLink(rows: SmartScripts[], smartScript: SmartScripts): SmartScripts | null {
    if (smartScript.id === 0) {
      return null;
    }

    for (const row of rows) {
      if (row.link === smartScript.id) {
        // if previous is LINK, return previous of previous
        if (row.event_type === SAI_EVENTS.LINK) {
          return this.getPreviousScriptLink(rows, row);
        }

        return row;
      }
    }

    /* istanbul ignore next */ // TODO: fix coverage?
    return null;
  }

  private async generateEventComment(smartScript: SmartScripts, name: string, smartScriptLink: SmartScripts): Promise<string> {
    let eventLine = '';

    switch (Number(smartScript.source_type)) {
      case SAI_TYPES.SAI_TYPE_CREATURE:
      case SAI_TYPES.SAI_TYPE_GAMEOBJECT:
        eventLine += name + ' - ';
        const comment = SAI_EVENT_COMMENTS[smartScript.event_type];
        if (!comment) {
          const error = `Missing comment for event_type ${smartScript.event_type}`;
          console.error(error);
          return error;
        }
        eventLine += comment;
        break;

      case SAI_TYPES.SAI_TYPE_AREATRIGGER:
        eventLine += 'Areatrigger - ';

        switch (Number(smartScript.event_type)) {
          case SAI_EVENTS.AREATRIGGER_ONTRIGGER:
          case SAI_EVENTS.LINK:
            eventLine += 'On Trigger';
            break;
          default:
            eventLine += 'INCORRECT EVENT TYPE';
            break;
        }

        break;

      case SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST:
        eventLine += `${name} - Actionlist`;
        break;
    }

    if (eventLine.indexOf('_previousLineComment_') > -1 && smartScriptLink != null) {
      eventLine = eventLine.replace('_previousLineComment_', SAI_EVENT_COMMENTS[smartScriptLink.event_type]);
      smartScript.event_param1 = smartScriptLink.event_param1;
      smartScript.event_param2 = smartScriptLink.event_param2;
      smartScript.event_param3 = smartScriptLink.event_param3;
      smartScript.event_param4 = smartScriptLink.event_param4;
    }

    eventLine = eventLine.replace('_previousLineComment_', 'MISSING LINK');

    eventLine = eventLine.replace('_eventParamOne_', `${smartScript.event_param1}`);
    eventLine = eventLine.replace('_eventParamTwo_', `${smartScript.event_param2}`);
    eventLine = eventLine.replace('_eventParamThree_', `${smartScript.event_param3}`);
    eventLine = eventLine.replace('_eventParamFour_', `${smartScript.event_param4}`);
    eventLine = eventLine.replace('_eventParamFive_', `${smartScript.event_param5}`);
    eventLine = eventLine.replace('_eventParamSix_', `${smartScript.event_param6}`);

    if (eventLine.indexOf('_questNameEventParamOne_') > -1) {
      eventLine = eventLine.replace('_questNameEventParamOne_', await this.queryService.getQuestTitleById(smartScript.event_param1));
    }
    if (eventLine.indexOf('_spellNameEventParamOne_') > -1) {
      eventLine = eventLine.replace('_spellNameEventParamOne_', await this.sqliteQueryService.getSpellNameById(smartScript.event_param1));
    }
    if (eventLine.indexOf('_targetCastingSpellName_') > -1) {
      eventLine = eventLine.replace('_targetCastingSpellName_', await this.sqliteQueryService.getSpellNameById(smartScript.event_param3));
    }
    if (eventLine.indexOf('_hasAuraEventParamOne_') > -1) {
      eventLine = eventLine.replace('_hasAuraEventParamOne_', await this.sqliteQueryService.getSpellNameById(smartScript.event_param1));
    }

    if (eventLine.indexOf('_waypointParamOne_') > -1) {
      eventLine = eventLine.replace('_waypointParamOne_', smartScript.event_param1 > 0 ? `${smartScript.event_param1}` : 'Any');
    }
    if (eventLine.indexOf('_waypointParamTwo_') > -1) {
      eventLine = eventLine.replace('_waypointParamTwo_', smartScript.event_param2 > 0 ? `${smartScript.event_param2}` : 'Any');
    }

    return eventLine;
  }

  private async generateActionComment(smartScript: SmartScripts, smartScriptLink: SmartScripts): Promise<string> {
    let actionLine = SAI_ACTION_COMMENTS[smartScript.action_type];

    if (!actionLine) {
      const error = `Missing comment for action_type ${smartScript.action_type}`;
      console.error(error);
      return error;
    }

    actionLine = actionLine.replace('_actionParamOne_', `${smartScript.action_param1}`);
    actionLine = actionLine.replace('_actionParamTwo_', `${smartScript.action_param2}`);
    actionLine = actionLine.replace('_actionParamThree_', `${smartScript.action_param3}`);
    actionLine = actionLine.replace('_actionParamFour_', `${smartScript.action_param4}`);
    actionLine = actionLine.replace('_actionParamFive_', `${smartScript.action_param5}`);
    actionLine = actionLine.replace('_actionParamSix_', `${smartScript.action_param6}`);

    if (actionLine.indexOf('_questNameActionParamOne_') > -1) {
      actionLine = actionLine.replace('_questNameActionParamOne_', await this.queryService.getQuestTitleById(smartScript.action_param1));
    }
    if (actionLine.indexOf('_questNameKillCredit_') > -1) {
      actionLine = actionLine.replace(
        '_questNameKillCredit_',
        await this.queryService.getQuestTitleByCriteria(
          smartScript.action_param1,
          smartScript.action_param1,
          smartScript.action_param1,
          smartScript.action_param1,
        ),
      );
    }
    if (actionLine.indexOf('_spellNameActionParamOne_') > -1) {
      actionLine = actionLine.replace(
        '_spellNameActionParamOne_',
        await this.sqliteQueryService.getSpellNameById(smartScript.action_param1),
      );
    }
    if (actionLine.indexOf('_spellNameActionParamTwo_') > -1) {
      actionLine = actionLine.replace(
        '_spellNameActionParamTwo_',
        await this.sqliteQueryService.getSpellNameById(smartScript.action_param2),
      );
    }

    if (actionLine.indexOf('_reactStateParamOne_') > -1) {
      switch (Number(smartScript.action_param1)) {
        case 0:
          actionLine = actionLine.replace('_reactStateParamOne_', 'Passive');
          break;
        case 1:
          actionLine = actionLine.replace('_reactStateParamOne_', 'Defensive');
          break;
        case 2:
          actionLine = actionLine.replace('_reactStateParamOne_', 'Aggressive');
          break;
        default:
          actionLine = actionLine.replace('_reactStateParamOne_', '[Unknown Reactstate]');
          break;
      }
    }

    if (actionLine.indexOf('_followGroupParamTwo_') > -1) {
      let _followGroupParamTwo_: string;
      switch (Number(smartScript.action_param2)) {
        case 1:
          _followGroupParamTwo_ = 'Circle';
          break;
        case 2:
          _followGroupParamTwo_ = 'Semi-Circle Behind';
          break;
        case 3:
          _followGroupParamTwo_ = 'Semi-Circle Front';
          break;
        case 4:
          _followGroupParamTwo_ = 'Line';
          break;
        case 5:
          _followGroupParamTwo_ = 'Column';
          break;
        case 6:
          _followGroupParamTwo_ = 'Angular';
          break;
        default:
          _followGroupParamTwo_ = '[Unknown Follow Type]';
          break;
      }
      actionLine = actionLine.replace('_followGroupParamTwo_', _followGroupParamTwo_);
    }

    if (actionLine.indexOf('_actionRandomParameters_') > -1) {
      let randomEmotes = smartScript.action_param1 + ', ' + smartScript.action_param2;

      if (smartScript.action_param3 > 0) {
        randomEmotes += ', ' + smartScript.action_param3;
      }

      if (smartScript.action_param4 > 0) {
        randomEmotes += ', ' + smartScript.action_param4;
      }

      if (smartScript.action_param5 > 0) {
        randomEmotes += ', ' + smartScript.action_param5;
      }

      if (smartScript.action_param6 > 0) {
        randomEmotes += ', ' + smartScript.action_param6;
      }

      actionLine = actionLine.replace('_actionRandomParameters_', randomEmotes);
    }

    if (actionLine.indexOf('_creatureNameActionParamOne_') > -1) {
      actionLine = actionLine.replace(
        '_creatureNameActionParamOne_',
        await this.queryService.getCreatureNameById(smartScript.action_param1),
      );
    }

    if (actionLine.indexOf('_getUnitFlags_') > -1) {
      let commentUnitFlag = '';
      const unitFlags = smartScript.action_param1;

      if ((unitFlags & UNIT_FLAGS.SERVER_CONTROLLED) !== 0) {
        commentUnitFlag += 'Server Controlled & ';
      }
      if ((unitFlags & UNIT_FLAGS.NON_ATTACKABLE) !== 0) {
        commentUnitFlag += 'Not Attackable & ';
      }
      if ((unitFlags & UNIT_FLAGS.DISABLE_MOVE) !== 0) {
        commentUnitFlag += 'Disable Movement & ';
      }
      if ((unitFlags & UNIT_FLAGS.PVP_ATTACKABLE) !== 0) {
        commentUnitFlag += 'PvP Attackable & ';
      }
      if ((unitFlags & UNIT_FLAGS.RENAME) !== 0) {
        commentUnitFlag += 'Rename & ';
      }
      if ((unitFlags & UNIT_FLAGS.PREPARATION) !== 0) {
        commentUnitFlag += 'Preparation & ';
      }
      if ((unitFlags & UNIT_FLAGS.NOT_ATTACKABLE_1) !== 0) {
        commentUnitFlag += 'Not Attackable & ';
      }
      if ((unitFlags & UNIT_FLAGS.IMMUNE_TO_PC) !== 0) {
        commentUnitFlag += 'Immune To Players & ';
      }
      if ((unitFlags & UNIT_FLAGS.IMMUNE_TO_NPC) !== 0) {
        commentUnitFlag += "Immune To NPC's & ";
      }
      if ((unitFlags & UNIT_FLAGS.LOOTING) !== 0) {
        commentUnitFlag += 'Looting & ';
      }
      if ((unitFlags & UNIT_FLAGS.PET_IN_COMBAT) !== 0) {
        commentUnitFlag += 'Pet In Combat & ';
      }
      if ((unitFlags & UNIT_FLAGS.PVP) !== 0) {
        commentUnitFlag += 'PvP & ';
      }
      if ((unitFlags & UNIT_FLAGS.SILENCED) !== 0) {
        commentUnitFlag += 'Silenced & ';
      }
      if ((unitFlags & UNIT_FLAGS.PACIFIED) !== 0) {
        commentUnitFlag += 'Pacified & ';
      }
      if ((unitFlags & UNIT_FLAGS.STUNNED) !== 0) {
        commentUnitFlag += 'Stunned & ';
      }
      if ((unitFlags & UNIT_FLAGS.IN_COMBAT) !== 0) {
        commentUnitFlag += 'In Combat & ';
      }
      if ((unitFlags & UNIT_FLAGS.DISARMED) !== 0) {
        commentUnitFlag += 'Disarmed & ';
      }
      if ((unitFlags & UNIT_FLAGS.CONFUSED) !== 0) {
        commentUnitFlag += 'Confused & ';
      }
      if ((unitFlags & UNIT_FLAGS.FLEEING) !== 0) {
        commentUnitFlag += 'Fleeing & ';
      }
      if ((unitFlags & UNIT_FLAGS.PLAYER_CONTROLLED) !== 0) {
        commentUnitFlag += 'Player Controlled & ';
      }
      if ((unitFlags & UNIT_FLAGS.NOT_SELECTABLE) !== 0) {
        commentUnitFlag += 'Not Selectable & ';
      }
      if ((unitFlags & UNIT_FLAGS.SKINNABLE) !== 0) {
        commentUnitFlag += 'Skinnable & ';
      }
      if ((unitFlags & UNIT_FLAGS.MOUNT) !== 0) {
        commentUnitFlag += 'Mounted & ';
      }
      if ((unitFlags & UNIT_FLAGS.SHEATHE) !== 0) {
        commentUnitFlag += 'Sheathed & ';
      }

      if (commentUnitFlag.indexOf('&') > -1) {
        // ! Trim last ' & ' from the comment..
        commentUnitFlag = commentUnitFlag.substring(0, commentUnitFlag.length - 3);

        actionLine = actionLine.replace('_getUnitFlags_', 's_getUnitFlags_');
      }

      actionLine = actionLine.replace('_getUnitFlags_', ' ' + commentUnitFlag);
    }

    if (actionLine.indexOf('_getNpcFlags_') > -1) {
      let commentNpcFlag = '';
      const npcFlags = smartScript.action_param1;

      if ((npcFlags & NPC_FLAGS.GOSSIP) !== 0) {
        commentNpcFlag += 'Gossip & ';
      }
      if ((npcFlags & NPC_FLAGS.QUESTGIVER) !== 0) {
        commentNpcFlag += 'Questgiver & ';
      }
      if ((npcFlags & NPC_FLAGS.UNK1) !== 0) {
        commentNpcFlag += 'Unknown 1 & ';
      }
      if ((npcFlags & NPC_FLAGS.UNK2) !== 0) {
        commentNpcFlag += 'Unknown 2 & ';
      }
      if ((npcFlags & NPC_FLAGS.TRAINER) !== 0) {
        commentNpcFlag += 'Trainer & ';
      }
      if ((npcFlags & NPC_FLAGS.TRAINER_CLASS) !== 0) {
        commentNpcFlag += 'Class Trainer & ';
      }
      if ((npcFlags & NPC_FLAGS.TRAINER_PROFESSION) !== 0) {
        commentNpcFlag += 'Profession Trainer & ';
      }
      if ((npcFlags & NPC_FLAGS.VENDOR) !== 0) {
        commentNpcFlag += 'Vendor & ';
      }
      if ((npcFlags & NPC_FLAGS.VENDOR_AMMO) !== 0) {
        commentNpcFlag += 'Ammo Vendor & ';
      }
      if ((npcFlags & NPC_FLAGS.VENDOR_FOOD) !== 0) {
        commentNpcFlag += 'Food Vendor & ';
      }
      if ((npcFlags & NPC_FLAGS.VENDOR_POISON) !== 0) {
        commentNpcFlag += 'Poison Vendor & ';
      }
      if ((npcFlags & NPC_FLAGS.VENDOR_REAGENT) !== 0) {
        commentNpcFlag += 'Reagent Vendor & ';
      }
      if ((npcFlags & NPC_FLAGS.REPAIR) !== 0) {
        commentNpcFlag += 'Repair Vendor & ';
      }
      if ((npcFlags & NPC_FLAGS.FLIGHTMASTER) !== 0) {
        commentNpcFlag += 'Flightmaster & ';
      }
      if ((npcFlags & NPC_FLAGS.SPIRITHEALER) !== 0) {
        commentNpcFlag += 'Spirithealer & ';
      }
      if ((npcFlags & NPC_FLAGS.SPIRITGUIDE) !== 0) {
        commentNpcFlag += 'Spiritguide & ';
      }
      if ((npcFlags & NPC_FLAGS.INNKEEPER) !== 0) {
        commentNpcFlag += 'Innkeeper & ';
      }
      if ((npcFlags & NPC_FLAGS.BANKER) !== 0) {
        commentNpcFlag += 'Banker & ';
      }
      if ((npcFlags & NPC_FLAGS.PETITIONER) !== 0) {
        commentNpcFlag += 'Petitioner & ';
      }
      if ((npcFlags & NPC_FLAGS.TABARDDESIGNER) !== 0) {
        commentNpcFlag += 'Tabard Designer & ';
      }
      if ((npcFlags & NPC_FLAGS.BATTLEMASTER) !== 0) {
        commentNpcFlag += 'Battlemaster & ';
      }
      if ((npcFlags & NPC_FLAGS.AUCTIONEER) !== 0) {
        commentNpcFlag += 'Auctioneer & ';
      }
      if ((npcFlags & NPC_FLAGS.STABLEMASTER) !== 0) {
        commentNpcFlag += 'Stablemaster & ';
      }
      if ((npcFlags & NPC_FLAGS.GUILD_BANKER) !== 0) {
        commentNpcFlag += 'Guild Banker & ';
      }
      if ((npcFlags & NPC_FLAGS.SPELLCLICK) !== 0) {
        commentNpcFlag += 'Spellclick & ';
      }
      if ((npcFlags & NPC_FLAGS.PLAYER_VEHICLE) !== 0) {
        commentNpcFlag += 'Player Vehicle & ';
      }

      if (commentNpcFlag.indexOf('&') > -1) {
        // ! Trim last ' & ' from the comment..
        commentNpcFlag = commentNpcFlag.substring(0, commentNpcFlag.length - 3);

        actionLine = actionLine.replace('_getNpcFlags_', 's_getNpcFlags_');
      }

      actionLine = actionLine.replace('_getNpcFlags_', ' ' + commentNpcFlag);
    }

    if (actionLine.indexOf('_startOrStopActionParamOne_') > -1) {
      if (`${smartScript.action_param1}` === '0') {
        actionLine = actionLine.replace('_startOrStopActionParamOne_', 'Stop');
      } else {
        // ! Even if above 1 or below 0 we start attacking/allow-combat-movement
        actionLine = actionLine.replace('_startOrStopActionParamOne_', 'Start');
      }
    }

    if (actionLine.indexOf('_enableDisableActionParamOne_') > -1) {
      if (`${smartScript.action_param1}` === '0') {
        actionLine = actionLine.replace('_enableDisableActionParamOne_', 'Disable');
      } else {
        // ! Even if above 1 or below 0 we start attacking/allow-combat-movement
        actionLine = actionLine.replace('_enableDisableActionParamOne_', 'Enable');
      }
    }

    if (actionLine.indexOf('_enableDisableInvertActionParamOne_') > -1) {
      const enableOrDisable = `${smartScript.action_param1}` === '0' ? 'Enable' : 'Disable';
      actionLine = actionLine.replace('_enableDisableInvertActionParamOne_', enableOrDisable);
    }

    if (actionLine.indexOf('_incrementOrDecrementActionParamOne_') > -1) {
      if (`${smartScript.action_param1}` === '1') {
        actionLine = actionLine.replace('_incrementOrDecrementActionParamOne_', 'Increment');
      } else if (`${smartScript.action_param2}` === '1') {
        actionLine = actionLine.replace('_incrementOrDecrementActionParamOne_', 'Decrement');
      } else {
        actionLine = actionLine.replace('_incrementOrDecrementActionParamOne_', 'Increment or Decrement');
      }
      // else //? What to do?
    }

    if (actionLine.indexOf('_sheathActionParamOne_') > -1) {
      switch (Number(smartScript.action_param1)) {
        case 0:
          actionLine = actionLine.replace('_sheathActionParamOne_', 'Unarmed');
          break;
        case 1:
          actionLine = actionLine.replace('_sheathActionParamOne_', 'Melee');
          break;
        case 2:
          actionLine = actionLine.replace('_sheathActionParamOne_', 'Ranged');
          break;
        default:
          actionLine = actionLine.replace('_sheathActionParamOne_', '[Unknown Sheath]');
          break;
      }
    }

    if (actionLine.indexOf('_waypointStartActionParamThree_') > -1) {
      let waypointReplace: string;
      switch (Number(smartScript.action_param3)) {
        case 0:
          waypointReplace = 'Waypoint ';
          break;
        case 1:
          waypointReplace = 'Patrol ';
          break;
        default:
          waypointReplace = '[Unknown Value] ';
          break;
      }

      actionLine = actionLine.replace('_waypointStartActionParamThree_', waypointReplace);
    }

    if (actionLine.indexOf('_movementTypeActionParamOne_') > -1) {
      let movementType: string;
      switch (Number(smartScript.action_param1)) {
        case 0:
          movementType = 'Walk';
          break;
        case 1:
          movementType = 'Run';
          break;
        case 2:
          movementType = 'Run Back';
          break;
        case 3:
          movementType = 'Swim';
          break;
        case 4:
          movementType = 'Swim Back';
          break;
        case 5:
          movementType = 'Turn Rate';
          break;
        case 6:
          movementType = 'Flight';
          break;
        case 7:
          movementType = 'Flight Back';
          break;
        case 8:
          movementType = 'Pitch Rate';
          break;
        default:
          movementType = '[Unknown Value]';
          break;
      }
      actionLine = actionLine.replace('_movementTypeActionParamOne_', movementType);
    }

    if (actionLine.indexOf('_forceDespawnActionParamOne_') > -1) {
      if (smartScript.action_param1 > 2) {
        actionLine = actionLine.replace('_forceDespawnActionParamOne_', 'In ' + smartScript.action_param1 + ' ms');
      } else {
        actionLine = actionLine.replace('_forceDespawnActionParamOne_', 'Instant');
      }
    }

    if (actionLine.indexOf('_invincibilityHpActionParamsOneTwo_') > -1) {
      if (smartScript.action_param1 > 0) {
        actionLine = actionLine.replace('_invincibilityHpActionParamsOneTwo_', 'Set Invincibility Hp ' + smartScript.action_param1);
      } else if (smartScript.action_param2 > 0) {
        actionLine = actionLine.replace('_invincibilityHpActionParamsOneTwo_', 'Set Invincibility Hp ' + smartScript.action_param2 + '%');
      } else if (smartScript.action_param1 === 0 && smartScript.action_param2 === 0) {
        actionLine = actionLine.replace('_invincibilityHpActionParamsOneTwo_', 'Reset Invincibility Hp');
      } else {
        actionLine = actionLine.replace('_invincibilityHpActionParamsOneTwo_', '[Unsupported parameters]');
      }
    }

    if (actionLine.indexOf('_onOffActionParamOne_') > -1) {
      if (smartScript.action_param1 === 1) {
        actionLine = actionLine.replace('_onOffActionParamOne_', 'On');
      } else {
        actionLine = actionLine.replace('_onOffActionParamOne_', 'Off');
      }
    }

    if (actionLine.indexOf('_onOffActionParamTwo_') > -1) {
      if (smartScript.action_param2 === 1) {
        actionLine = actionLine.replace('_onOffActionParamTwo_', 'On');
      } else {
        actionLine = actionLine.replace('_onOffActionParamTwo_', 'Off');
      }
    }

    if (actionLine.indexOf('_gameobjectNameActionParamOne_') > -1) {
      actionLine = actionLine.replace(
        '_gameobjectNameActionParamOne_',
        `'${await this.queryService.getGameObjectNameById(smartScript.action_param1)}'`,
      );
    }

    if (actionLine.indexOf('_addItemBasedOnActionParams_') > -1) {
      actionLine = actionLine.replace(
        '_addItemBasedOnActionParams_',
        `'${await this.queryService.getItemNameById(smartScript.action_param1)}'`,
      );

      if (smartScript.action_param2 > 1) {
        actionLine += ' ' + smartScript.action_param2 + ' Times';
      } else {
        actionLine += ' 1 Time';
      }
    }

    if (actionLine.indexOf('_updateAiTemplateActionParamOne_') > -1) {
      switch (Number(smartScript.action_param1)) {
        case templates.BASIC:
          actionLine = actionLine.replace('_updateAiTemplateActionParamOne_', 'Basic');
          break;
        case templates.CASTER:
          actionLine = actionLine.replace('_updateAiTemplateActionParamOne_', 'Caster');
          break;
        case templates.TURRET:
          actionLine = actionLine.replace('_updateAiTemplateActionParamOne_', 'Turret');
          break;
        case templates.PASSIVE:
          actionLine = actionLine.replace('_updateAiTemplateActionParamOne_', 'Passive');
          break;
        case templates.CAGED_GO_PART:
          actionLine = actionLine.replace('_updateAiTemplateActionParamOne_', 'Caged Gameobject Part');
          break;
        case templates.CAGED_NPC_PART:
          actionLine = actionLine.replace('_updateAiTemplateActionParamOne_', 'Caged Creature Part');
          break;
        default:
          actionLine = actionLine.replace('_updateAiTemplateActionParamOne_', '[_updateAiTemplateActionParamOne_ Unknown ai template]');
          break;
      }
    }

    if (actionLine.indexOf('_setOrientationTargetType_') > -1) {
      switch (Number(smartScript.target_type)) {
        case SAI_TARGETS.SELF:
          actionLine = actionLine.replace('_setOrientationTargetType_', 'Home Position');
          break;
        case SAI_TARGETS.POSITION:
          actionLine = actionLine.replace('_setOrientationTargetType_', `${smartScript.target_o}`);
          break;
        default:
          actionLine = actionLine.replace('_setOrientationTargetType_', await this.getStringByTargetType(smartScript));
          break;
      }
    }

    if (actionLine.indexOf('_startOrStopBasedOnTargetType_') > -1) {
      if (smartScript.target_type === 0) {
        actionLine = actionLine.replace('_startOrStopBasedOnTargetType_', 'Stop');
        actionLine = actionLine.replace('_getTargetType_', '');
      } else {
        actionLine = actionLine.replace('_startOrStopBasedOnTargetType_', 'Start');
      }
    }

    if (actionLine.indexOf('_getTargetType_') > -1) {
      actionLine = actionLine.replace('_getTargetType_', await this.getStringByTargetType(smartScript));
    }

    if (actionLine.indexOf('_goStateActionParamOne_') > -1) {
      switch (Number(smartScript.action_param1)) {
        case 0:
          actionLine = actionLine.replace('_goStateActionParamOne_', 'Not Ready');
          break;
        case 1:
          actionLine = actionLine.replace('_goStateActionParamOne_', 'Ready');
          break;
        case 2:
          actionLine = actionLine.replace('_goStateActionParamOne_', 'Activated');
          break;
        case 3:
          actionLine = actionLine.replace('_goStateActionParamOne_', 'Deactivated');
          break;
        default:
          actionLine = actionLine.replace('_goStateActionParamOne_', '[Unknown Gameobject State]');
          break;
      }
    }

    if (actionLine.indexOf('_getGoFlags_') > -1) {
      let commentGoFlag = '';
      const goFlags = smartScript.action_param1;

      if ((goFlags & GO_FLAGS.IN_USE) !== 0) {
        commentGoFlag += 'In Use & ';
      }
      if ((goFlags & GO_FLAGS.LOCKED) !== 0) {
        commentGoFlag += 'Locked & ';
      }
      if ((goFlags & GO_FLAGS.INTERACT_COND) !== 0) {
        commentGoFlag += 'Interact Condition & ';
      }
      if ((goFlags & GO_FLAGS.TRANSPORT) !== 0) {
        commentGoFlag += 'Transport & ';
      }
      if ((goFlags & GO_FLAGS.NOT_SELECTABLE) !== 0) {
        commentGoFlag += 'Not Selectable & ';
      }
      if ((goFlags & GO_FLAGS.NODESPAWN) !== 0) {
        commentGoFlag += 'No Despawn & ';
      }
      if ((goFlags & GO_FLAGS.TRIGGERED) !== 0) {
        commentGoFlag += 'Triggered & ';
      }
      if ((goFlags & GO_FLAGS.FREEZE_ANIMATION) !== 0) {
        commentGoFlag += 'Freezed & ';
      }
      if ((goFlags & GO_FLAGS.DAMAGED) !== 0) {
        commentGoFlag += 'Damaged & ';
      }
      if ((goFlags & GO_FLAGS.DESTROYED) !== 0) {
        commentGoFlag += 'Destroyed & ';
      }

      if (commentGoFlag.indexOf('&') > -1) {
        // ! Trim last ' & ' from the comment..
        commentGoFlag = commentGoFlag.substring(0, commentGoFlag.length - 3);

        actionLine = actionLine.replace('_getGoFlags_', 's_getGoFlags_');
      }

      actionLine = actionLine.replace('_getGoFlags_', ' ' + commentGoFlag);
    }

    if (actionLine.indexOf('_getDynamicFlags_') > -1) {
      let commentDynamicFlag = '';
      const dynamicFlags = smartScript.action_param1;

      if ((dynamicFlags & DYNAMIC_FLAGS.LOOTABLE) !== 0) {
        commentDynamicFlag += 'Lootable & ';
      }
      if ((dynamicFlags & DYNAMIC_FLAGS.TRACK_UNIT) !== 0) {
        commentDynamicFlag += 'Track Units & ';
      }
      if ((dynamicFlags & DYNAMIC_FLAGS.TAPPED) !== 0) {
        commentDynamicFlag += 'Tapped & ';
      }
      if ((dynamicFlags & DYNAMIC_FLAGS.TAPPED_BY_PLAYER) !== 0) {
        commentDynamicFlag += 'Tapped By Player & ';
      }
      if ((dynamicFlags & DYNAMIC_FLAGS.SPECIALINFO) !== 0) {
        commentDynamicFlag += 'Special Info & ';
      }
      if ((dynamicFlags & DYNAMIC_FLAGS.DEAD) !== 0) {
        commentDynamicFlag += 'Dead & ';
      }
      if ((dynamicFlags & DYNAMIC_FLAGS.REFER_A_FRIEND) !== 0) {
        commentDynamicFlag += 'Refer A Friend & ';
      }
      if ((dynamicFlags & DYNAMIC_FLAGS.TAPPED_BY_ALL_THREAT_LIST) !== 0) {
        commentDynamicFlag += 'Tapped By Threatlist & ';
      }

      if (commentDynamicFlag.indexOf('&') > -1) {
        // ! Trim last ' & ' from the comment..
        commentDynamicFlag = commentDynamicFlag.substring(0, commentDynamicFlag.length - 3);

        actionLine = actionLine.replace('_getDynamicFlags_', 's_getDynamicFlags_');
      }

      actionLine = actionLine.replace('_getDynamicFlags_', ' ' + commentDynamicFlag);
    }

    if (actionLine.indexOf('_getBytes1Flags_') > -1) {
      switch (Number(smartScript.action_param2)) {
        case unitFieldBytes1Type.STAND_STAND_STATE_TYPE:
          switch (Number(smartScript.action_param1)) {
            case unitStandStateType.STAND:
              actionLine = actionLine.replace('_getBytes1Flags_', 'Standstate Stand Up');
              break;
            case unitStandStateType.SIT:
              actionLine = actionLine.replace('_getBytes1Flags_', 'Standstate Sit Down');
              break;
            case unitStandStateType.SIT_CHAIR:
              actionLine = actionLine.replace('_getBytes1Flags_', 'Standstate Sit Down Chair');
              break;
            case unitStandStateType.SLEEP:
              actionLine = actionLine.replace('_getBytes1Flags_', 'Standstate Sleep');
              break;
            case unitStandStateType.SIT_LOW_CHAIR:
              actionLine = actionLine.replace('_getBytes1Flags_', 'Standstate Sit Low Chair');
              break;
            case unitStandStateType.SIT_MEDIUM_CHAIR:
              actionLine = actionLine.replace('_getBytes1Flags_', 'Standstate Sit Medium Chair');
              break;
            case unitStandStateType.SIT_HIGH_CHAIR:
              actionLine = actionLine.replace('_getBytes1Flags_', 'Standstate Sit High Chair');
              break;
            case unitStandStateType.DEAD:
              actionLine = actionLine.replace('_getBytes1Flags_', 'Standstate Dead');
              break;
            case unitStandStateType.KNEEL:
              actionLine = actionLine.replace('_getBytes1Flags_', 'Standstate Kneel');
              break;
            case unitStandStateType.SUBMERGED:
              actionLine = actionLine.replace('_getBytes1Flags_', 'Standstate Submerged');
              break;
            default:
              actionLine = actionLine.replace('_getBytes1Flags_', '[Unknown bytes1 (unitStandStateType.)]');
              break;
          }
          break;

        case unitFieldBytes1Type.PET_TALENTS_TYPE:
          actionLine = actionLine.replace('_getBytes1Flags_', '[Unknown bytes1 type]');
          break;

        case unitFieldBytes1Type.STAND_FLAGS_TYPE:
          switch (Number(smartScript.action_param1)) {
            case unitStandFlags.UNK1:
            case unitStandFlags.UNK4:
            case unitStandFlags.UNK5:
              actionLine = actionLine.replace('_getBytes1Flags_', '[Unknown]');
              break;
            case unitStandFlags.CREEP:
              actionLine = actionLine.replace('_getBytes1Flags_', 'Creep');
              break;
            case unitStandFlags.UNTRACKABLE:
              actionLine = actionLine.replace('_getBytes1Flags_', 'Untrackable');
              break;
            default:
              actionLine = actionLine.replace('_getBytes1Flags_', '[Unknown bytes1 (UnitStandFlags)]');
              break;
          }
          break;

        case unitFieldBytes1Type.BYTES1_FLAGS_TYPE:
          switch (Number(smartScript.action_param1)) {
            case unitBytes1Flags.UNK_3:
              actionLine = actionLine.replace('_getBytes1Flags_', '[Unknown]');
              break;
            case unitBytes1Flags.HOVER:
              actionLine = actionLine.replace('_getBytes1Flags_', 'Hover');
              break;
            case unitBytes1Flags.ALWAYS_STAND:
              actionLine = actionLine.replace('_getBytes1Flags_', 'Always Stand');
              break;
            default:
              actionLine = actionLine.replace('_getBytes1Flags_', '[Unknown bytes1 (UnitBytes1_Flags)]');
              break;
          }
          break;

        default:
          break;
      }
    }

    if (actionLine.indexOf('_powerTypeActionParamOne_') > -1) {
      switch (Number(smartScript.action_param1)) {
        case 0:
          actionLine = actionLine.replace('_powerTypeActionParamOne_', 'Mana');
          break;
        case 1:
          actionLine = actionLine.replace('_powerTypeActionParamOne_', 'Rage');
          break;
        case 2:
          actionLine = actionLine.replace('_powerTypeActionParamOne_', 'Focus');
          break;
        case 3:
          actionLine = actionLine.replace('_powerTypeActionParamOne_', 'Energy');
          break;
        case 4:
          actionLine = actionLine.replace('_powerTypeActionParamOne_', 'Happiness');
          break;
        case 5:
          actionLine = actionLine.replace('_powerTypeActionParamOne_', 'Rune');
          break;
        case 6:
          actionLine = actionLine.replace('_powerTypeActionParamOne_', 'Runic Power');
          break;
        default:
          actionLine = actionLine.replace('_powerTypeActionParamOne_', '[Unknown Powertype]');
          break;
      }
    }

    if (actionLine.indexOf('_morphToEntryOrModelActionParams_') > -1) {
      if (smartScript.action_param1 > 0) {
        actionLine = actionLine.replace(
          '_morphToEntryOrModelActionParams_',
          'Morph To Creature ' + (await this.queryService.getCreatureNameById(smartScript.action_param1)),
        );
      } else if (smartScript.action_param2 > 0) {
        actionLine = actionLine.replace('_morphToEntryOrModelActionParams_', 'Morph To Model ' + smartScript.action_param2);
      } else {
        actionLine = actionLine.replace('_morphToEntryOrModelActionParams_', 'Demorph');
      }
    }

    if (actionLine.indexOf('_mountToEntryOrModelActionParams_') > -1) {
      if (smartScript.action_param1 > 0) {
        actionLine = actionLine.replace(
          '_mountToEntryOrModelActionParams_',
          'Mount To Creature ' + (await this.queryService.getCreatureNameById(smartScript.action_param1)),
        );
      } else if (smartScript.action_param2 > 0) {
        actionLine = actionLine.replace('_mountToEntryOrModelActionParams_', 'Mount To Model ' + smartScript.action_param2);
      } else {
        actionLine = actionLine.replace('_mountToEntryOrModelActionParams_', 'Dismount');
      }
    }

    let event_phase_mask = smartScriptLink != null ? smartScriptLink.event_phase_mask : smartScript.event_phase_mask;

    if (event_phase_mask !== phaseMask.ALWAYS) {
      const arrayOfSplitPhases = [];

      let event_phase_mask2 = event_phase_mask;
      let log2 = 0;

      while (event_phase_mask2 >= 2) {
        event_phase_mask2 /= 2;
        log2++;
      }

      for (let l2 = log2; l2 >= 0; l2--) {
        const power = Math.pow(2, l2);

        if (event_phase_mask >= power) {
          event_phase_mask -= power;
          const smart_event_phase = Math.floor(Math.log(power) / Math.log(2)) + 1;
          arrayOfSplitPhases.push(smart_event_phase);
        }
      }

      arrayOfSplitPhases.reverse(); // Reverse them so they are ascending
      actionLine += ' (Phase';

      if (arrayOfSplitPhases.length > 1) {
        actionLine += 's';
      }

      actionLine += ' ' + arrayOfSplitPhases.join(' & ') + ')';
    }

    const event_flags = smartScriptLink != null ? smartScriptLink.event_flags : smartScript.event_flags;

    if (event_flags !== EVENT_FLAGS.NONE) {
      if ((event_flags & EVENT_FLAGS.NOT_REPEATABLE) !== 0) {
        actionLine += ' (No Repeat)';
      }

      if (
        (event_flags & EVENT_FLAGS.NORMAL_DUNGEON) !== 0 &&
        (event_flags & EVENT_FLAGS.HEROIC_DUNGEON) !== 0 &&
        (event_flags & EVENT_FLAGS.NORMAL_RAID) !== 0 &&
        (event_flags & EVENT_FLAGS.HEROIC_RAID) !== 0
      ) {
        actionLine += ' (Dungeon & Raid)';
      } else {
        if ((event_flags & EVENT_FLAGS.NORMAL_DUNGEON) !== 0 && (event_flags & EVENT_FLAGS.HEROIC_DUNGEON) !== 0) {
          actionLine += ' (Dungeon)';
        } else {
          if ((event_flags & EVENT_FLAGS.NORMAL_DUNGEON) !== 0) {
            actionLine += ' (Normal Dungeon)';
          } else if ((event_flags & EVENT_FLAGS.HEROIC_DUNGEON) !== 0) {
            actionLine += ' (Heroic Dungeon)';
          }
        }
      }

      if ((event_flags & EVENT_FLAGS.NORMAL_RAID) !== 0 && (event_flags & EVENT_FLAGS.HEROIC_RAID) !== 0) {
        actionLine += ' (Raid)';
      } else {
        if ((event_flags & EVENT_FLAGS.NORMAL_RAID) !== 0) {
          actionLine += ' (Normal Raid)';
        } else if ((event_flags & EVENT_FLAGS.HEROIC_RAID) !== 0) {
          actionLine += ' (Heroic Raid)';
        }
      }

      if ((event_flags & EVENT_FLAGS.DEBUG_ONLY) !== 0) {
        actionLine += ' (Debug)';
      }
    }

    return actionLine;
  }

  // SAI comment generator
  // partially based on https://github.com/jasperrietrae/SAI-Editor/blob/master/SAI-Editor/Classes/CommentGenerator.cs
  async generateComment(
    rows: SmartScripts[], // the set of smart_scripts rows
    smartScript: SmartScripts, // the specific row that we are generating the comment for
    name: string, // the name of the creature or gameobject
  ): Promise<string> {
    const smartScriptLink = this.getPreviousScriptLink(rows, smartScript);
    return `${await this.generateEventComment(smartScript, name, smartScriptLink as SmartScripts)} - ${await this.generateActionComment(
      smartScript,
      smartScriptLink as SmartScripts,
    )}`;
  }
}
