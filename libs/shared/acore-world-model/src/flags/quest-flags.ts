import { Flag } from '@keira/shared/constants';

export const QUEST_FLAG_SHARABLE = 0x00008;

export const QUEST_FLAGS: Flag[] = [
  { bit: 0, name: 'STAY_ALIVE - If the player dies, the quest is failed' },
  {
    bit: 1,
    name: 'PARTY_ACCEPT - All party members that can accept this quest will receive a confirmation box to accept quest',
  },
  { bit: 2, name: 'EXPLORATION - Involves the activation of an areatrigger' },
  { bit: 3, name: 'SHARABLE - Allows the quest to be shared with other players' },
  { bit: 4, name: 'HAS_CONDITION' },
  { bit: 5, name: 'HIDE_REWARD_POI' },
  { bit: 6, name: 'RAID - Can be completed while in raid' },
  { bit: 7, name: 'TBC - Available only if TBC expansion is enabled' },
  { bit: 8, name: 'NO_MONEY_FROM_XP - Experience is not converted to gold at max level' },
  {
    bit: 9,
    name: 'HIDDEN_REWARDS - Item and monetary rewards are hidden in the initial quest details page and in the quest log',
  },
  { bit: 10, name: 'TRACKING' },
  { bit: 11, name: 'DEPRECATE_REPUTATION' },
  { bit: 12, name: 'DAILY - Daily repeatable quests ' },
  { bit: 13, name: 'FLAGS_PVP - Having this quest in log forces PvP flag' },
  { bit: 14, name: 'UNAVAILABLE - Used on quests that are not generically available' },
  { bit: 15, name: 'WEEKLY - Weekly repeatable quests' },
  { bit: 16, name: 'AUTOCOMPLETE' },
  { bit: 17, name: 'DISPLAY_ITEM_IN_TRACKER - Displays usable item in quest tracker' },
  { bit: 18, name: 'OBJ_TEXT - Use Objective text as Complete text' },
  { bit: 19, name: 'AUTO_ACCEPT - The client recognizes this flag as auto-accept' },
];
