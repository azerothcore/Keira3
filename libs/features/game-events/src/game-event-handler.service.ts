import { Service, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import {
  GAME_EVENT_TABLE,
  GAME_EVENT_BATTLEGROUND_HOLIDAY_TABLE,
  GAME_EVENT_CREATURE_QUEST_TABLE,
  GAME_EVENT_CREATURE_TABLE,
  GAME_EVENT_GAMEOBJECT_QUEST_TABLE,
  GAME_EVENT_GAMEOBJECT_TABLE,
  GAME_EVENT_MODEL_EQUIP_TABLE,
  GAME_EVENT_NPCFLAG_TABLE,
  GAME_EVENT_NPC_VENDOR_TABLE,
  GAME_EVENT_POOL_TABLE,
  GAME_EVENT_PREREQUISITE_TABLE,
  GAME_EVENT_SEASONAL_QUEST_TABLE,
  GAME_EVENT_CONDITION_TABLE,
  GAME_EVENT_QUEST_CONDITION_TABLE,
  GAME_EVENT_ARENA_SEASON_TABLE,
  GameEvent,
} from '@keira/shared/acore-world-model';

@Service()
export class GameEventHandlerService extends HandlerService<GameEvent> {
  protected readonly mainEditorRoutePath = 'game-events/game-event';

  get isGameEventUnsaved(): Signal<boolean> {
    return this.statusMap[GAME_EVENT_TABLE].asReadonly();
  }

  get isGameEventCreatureUnsaved(): Signal<boolean> {
    return this.statusMap[GAME_EVENT_CREATURE_TABLE].asReadonly();
  }

  get isGameEventGameobjectUnsaved(): Signal<boolean> {
    return this.statusMap[GAME_EVENT_GAMEOBJECT_TABLE].asReadonly();
  }

  get isGameEventPoolUnsaved(): Signal<boolean> {
    return this.statusMap[GAME_EVENT_POOL_TABLE].asReadonly();
  }

  get isGameEventPrerequisiteUnsaved(): Signal<boolean> {
    return this.statusMap[GAME_EVENT_PREREQUISITE_TABLE].asReadonly();
  }

  get isGameEventNpcflagUnsaved(): Signal<boolean> {
    return this.statusMap[GAME_EVENT_NPCFLAG_TABLE].asReadonly();
  }

  get isGameEventModelEquipUnsaved(): Signal<boolean> {
    return this.statusMap[GAME_EVENT_MODEL_EQUIP_TABLE].asReadonly();
  }

  get isGameEventNpcVendorUnsaved(): Signal<boolean> {
    return this.statusMap[GAME_EVENT_NPC_VENDOR_TABLE].asReadonly();
  }

  get isGameEventCreatureQuestUnsaved(): Signal<boolean> {
    return this.statusMap[GAME_EVENT_CREATURE_QUEST_TABLE].asReadonly();
  }

  get isGameEventGameobjectQuestUnsaved(): Signal<boolean> {
    return this.statusMap[GAME_EVENT_GAMEOBJECT_QUEST_TABLE].asReadonly();
  }

  get isGameEventSeasonalQuestUnsaved(): Signal<boolean> {
    return this.statusMap[GAME_EVENT_SEASONAL_QUEST_TABLE].asReadonly();
  }

  get isGameEventBattlegroundHolidayUnsaved(): Signal<boolean> {
    return this.statusMap[GAME_EVENT_BATTLEGROUND_HOLIDAY_TABLE].asReadonly();
  }

  get isGameEventConditionUnsaved(): Signal<boolean> {
    return this.statusMap[GAME_EVENT_CONDITION_TABLE].asReadonly();
  }

  get isGameEventQuestConditionUnsaved(): Signal<boolean> {
    return this.statusMap[GAME_EVENT_QUEST_CONDITION_TABLE].asReadonly();
  }

  get isGameEventArenaSeasonUnsaved(): Signal<boolean> {
    return this.statusMap[GAME_EVENT_ARENA_SEASON_TABLE].asReadonly();
  }

  protected _statusMap = {
    [GAME_EVENT_TABLE]: signal(false),
    [GAME_EVENT_BATTLEGROUND_HOLIDAY_TABLE]: signal(false),
    [GAME_EVENT_CREATURE_QUEST_TABLE]: signal(false),
    [GAME_EVENT_CREATURE_TABLE]: signal(false),
    [GAME_EVENT_GAMEOBJECT_QUEST_TABLE]: signal(false),
    [GAME_EVENT_GAMEOBJECT_TABLE]: signal(false),
    [GAME_EVENT_MODEL_EQUIP_TABLE]: signal(false),
    [GAME_EVENT_NPCFLAG_TABLE]: signal(false),
    [GAME_EVENT_NPC_VENDOR_TABLE]: signal(false),
    [GAME_EVENT_POOL_TABLE]: signal(false),
    [GAME_EVENT_PREREQUISITE_TABLE]: signal(false),
    [GAME_EVENT_SEASONAL_QUEST_TABLE]: signal(false),
    [GAME_EVENT_ARENA_SEASON_TABLE]: signal(false),
    [GAME_EVENT_QUEST_CONDITION_TABLE]: signal(false),
    [GAME_EVENT_CONDITION_TABLE]: signal(false),
  };
}
