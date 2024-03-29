import { FieldDefinition } from '../types/general';

export const GO_DATA_FIELDS: FieldDefinition[][] = [];
GO_DATA_FIELDS[0] = [];
GO_DATA_FIELDS[0][0] = { name: 'startOpen', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[0][1] = { name: 'open', tooltip: 'GAMEOBJECT.TEMPLATE.LOCK_ID_FROM_DBC' };
GO_DATA_FIELDS[0][2] = { name: 'autoClose', tooltip: 'GAMEOBJECT.TEMPLATE.TIME_MS' };
GO_DATA_FIELDS[0][3] = { name: 'noDamageImmune', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[0][4] = { name: 'openTextID', tooltip: 'EMPTY' };
GO_DATA_FIELDS[0][5] = { name: 'closeTextID', tooltip: 'EMPTY' };
GO_DATA_FIELDS[0][6] = { name: 'ignored', tooltip: 'GAMEOBJECT.TEMPLATE.IGNORE_PATH' };
GO_DATA_FIELDS[0][7] = { name: 'conditionId1', tooltip: 'EMPTY' };
GO_DATA_FIELDS[0][8] = { name: 'doorOpaque', tooltip: 'EMPTY' };
GO_DATA_FIELDS[0][9] = { name: 'giganticAOI', tooltip: 'EMPTY' };
GO_DATA_FIELDS[0][10] = { name: 'infinite AOI', tooltip: 'EMPTY' };

GO_DATA_FIELDS[1] = [];
GO_DATA_FIELDS[1][0] = { name: 'startOpen', tooltip: 'GAMEOBJECT.TEMPLATE.STATE' };
GO_DATA_FIELDS[1][1] = { name: 'open', tooltip: 'GAMEOBJECT.TEMPLATE.LOCK_ID_FROM_DBC' };
GO_DATA_FIELDS[1][2] = { name: 'autoClose', tooltip: 'GAMEOBJECT.TEMPLATE.LONG_UNKNOWN_FLAG' };
GO_DATA_FIELDS[1][3] = { name: 'linkedTrap', tooltip: 'GAMEOBJECT.TEMPLATE.LINKED_TRAP' };
GO_DATA_FIELDS[1][4] = { name: 'noDamageImmune', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[1][5] = { name: 'large', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[1][6] = { name: 'openTextID', tooltip: 'GAMEOBJECT.TEMPLATE.UNKNOWN_TEXT_ID' };
GO_DATA_FIELDS[1][7] = { name: 'closeTextID', tooltip: 'GAMEOBJECT.TEMPLATE.UNKNOWN_TEXT_ID' };
GO_DATA_FIELDS[1][8] = { name: 'losOK', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[1][9] = { name: 'Conditionid1', tooltip: 'EMPTY' };

GO_DATA_FIELDS[2] = [];
GO_DATA_FIELDS[2][0] = { name: 'open', tooltip: 'GAMEOBJECT.TEMPLATE.LOCK_ID_FROM_DBC' };
GO_DATA_FIELDS[2][1] = { name: 'questList', tooltip: 'GAMEOBJECT.TEMPLATE.UNKNOWN_ID' };
GO_DATA_FIELDS[2][2] = { name: 'pageMaterial', tooltip: 'GAMEOBJECT.TEMPLATE.FROM_PAGE_MATERIAL' };
GO_DATA_FIELDS[2][3] = { name: 'gossipID', tooltip: 'GAMEOBJECT.TEMPLATE.GOSSIP_ID' };
GO_DATA_FIELDS[2][4] = { name: 'customAnim', tooltip: 'GAMEOBJECT.TEMPLATE.UNKNOWN_VALUE' };
GO_DATA_FIELDS[2][5] = { name: 'noDamageImmune', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[2][6] = { name: 'openTextID', tooltip: 'GAMEOBJECT.TEMPLATE.OPEN_TEXT_ID' };
GO_DATA_FIELDS[2][7] = { name: 'losOK', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[2][8] = { name: 'allowMounted', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[2][9] = { name: 'large', tooltip: 'EMPTY' };
GO_DATA_FIELDS[2][10] = { name: 'Conditionid1', tooltip: 'EMPTY' };
GO_DATA_FIELDS[2][11] = { name: 'mountForbidden', tooltip: 'GAMEOBJECT.TEMPLATE.NO_USABLE_MOUNTED' };

GO_DATA_FIELDS[3] = [];
GO_DATA_FIELDS[3][0] = { name: 'open', tooltip: 'GAMEOBJECT.TEMPLATE.LOCK_ID_FROM_DBC' };
GO_DATA_FIELDS[3][1] = { name: 'chestLoot', tooltip: 'GAMEOBJECT.TEMPLATE.ENTRY_FROM_GO_LOOT' };
GO_DATA_FIELDS[3][2] = { name: 'chestRestockTime', tooltip: 'GAMEOBJECT.TEMPLATE.TIME_S' };
GO_DATA_FIELDS[3][3] = { name: 'consumable', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[3][4] = { name: 'minRestock', tooltip: 'GAMEOBJECT.TEMPLATE.MIN_RESTOCK' };
GO_DATA_FIELDS[3][5] = { name: 'maxRestock', tooltip: 'GAMEOBJECT.TEMPLATE.MAX_RESTOCK' };
GO_DATA_FIELDS[3][6] = { name: 'lootedEvent', tooltip: 'GAMEOBJECT.TEMPLATE.LOOTED_EVENT' };
GO_DATA_FIELDS[3][7] = { name: 'linkedTrap', tooltip: 'GAMEOBJECT.TEMPLATE.ENTRY_FROM_GO_LOOT' };
GO_DATA_FIELDS[3][8] = { name: 'questID', tooltip: 'GAMEOBJECT.TEMPLATE.QUEST_ID' };
GO_DATA_FIELDS[3][9] = { name: 'level', tooltip: 'GAMEOBJECT.TEMPLATE.MINIMAL_LEVEL' };
GO_DATA_FIELDS[3][10] = { name: 'losOK', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[3][11] = { name: 'leaveLoot', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[3][12] = { name: 'notInCombat', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[3][13] = { name: 'logLoot', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[3][14] = { name: 'openTextID', tooltip: 'EMPTY' };
GO_DATA_FIELDS[3][15] = { name: 'useGroupLootRules', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[3][16] = { name: 'floatingTooltip', tooltip: 'EMPTY' };
GO_DATA_FIELDS[3][17] = { name: 'conditionid1', tooltip: 'EMPTY' };
GO_DATA_FIELDS[3][18] = { name: 'xplevel', tooltip: 'EMPTY' };
GO_DATA_FIELDS[3][19] = { name: 'xpDifficulty', tooltip: 'EMPTY' };
GO_DATA_FIELDS[3][20] = { name: 'lootlevel', tooltip: 'EMPTY' };
GO_DATA_FIELDS[3][21] = { name: 'Group', tooltip: 'EMPTY' };
GO_DATA_FIELDS[3][22] = { name: 'Damage', tooltip: 'GAMEOBJECT.TEMPLATE.DAMAGE' };
GO_DATA_FIELDS[3][23] = { name: 'trivialSkillLow', tooltip: 'GAMEOBJECT.TEMPLATE.IMMUNE' };

GO_DATA_FIELDS[5] = [];
GO_DATA_FIELDS[5][0] = { name: 'floatingTooltip', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[5][1] = { name: 'highlight', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[5][2] = { name: 'serverOnly', tooltip: 'ALWAYS_0' };
GO_DATA_FIELDS[5][3] = { name: 'large', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[5][4] = { name: 'floatOnWater', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[5][5] = { name: 'questID', tooltip: 'GAMEOBJECT.TEMPLATE.REQUIRED_ACTIVE_QUEST' };
GO_DATA_FIELDS[5][6] = { name: 'conditionID1', tooltip: 'EMPTY' };
GO_DATA_FIELDS[5][7] = { name: 'LargeAOI', tooltip: 'EMPTY' };
GO_DATA_FIELDS[5][8] = { name: 'UseGarrisonOwnerGuildColors', tooltip: 'EMPTY' };

GO_DATA_FIELDS[6] = [];
GO_DATA_FIELDS[6][0] = { name: 'open', tooltip: 'GAMEOBJECT.TEMPLATE.LOCK_ID_FROM_DBC ' };
GO_DATA_FIELDS[6][1] = { name: 'level', tooltip: 'GAMEOBJECT.TEMPLATE.LEVEL_CASTED_SPELL' };
GO_DATA_FIELDS[6][2] = { name: 'diameter', tooltip: 'GAMEOBJECT.TEMPLATE.RADIUS_2' };
GO_DATA_FIELDS[6][3] = { name: 'spell', tooltip: 'GAMEOBJECT.TEMPLATE.SPELL_ID_FROM_DBC' };
GO_DATA_FIELDS[6][4] = { name: 'type', tooltip: 'GAMEOBJECT.TEMPLATE.SPAWN_TYPE' };
GO_DATA_FIELDS[6][5] = { name: 'cooldown', tooltip: 'GAMEOBJECT.TEMPLATE.TIME_S' };
GO_DATA_FIELDS[6][6] = { name: '?', tooltip: 'GAMEOBJECT.TEMPLATE.UNKNOWN_FLAG' };
GO_DATA_FIELDS[6][7] = { name: 'startDelay', tooltip: 'GAMEOBJECT.TEMPLATE.TIME_S' };
GO_DATA_FIELDS[6][8] = { name: 'serverOnly', tooltip: 'ALWAYS_0' };
GO_DATA_FIELDS[6][9] = { name: 'stealthed', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[6][10] = { name: 'large', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[6][11] = { name: 'invisible', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[6][12] = { name: 'openTextID', tooltip: 'GAMEOBJECT.TEMPLATE.UNKNOWN_ID' };
GO_DATA_FIELDS[6][13] = { name: 'closeTextID', tooltip: 'EMPTY' };
GO_DATA_FIELDS[6][14] = { name: 'IgnoreTotems', tooltip: 'EMPTY' };
GO_DATA_FIELDS[6][15] = { name: 'conditionID1', tooltip: 'EMPTY' };
GO_DATA_FIELDS[6][16] = { name: 'playerCast', tooltip: 'EMPTY' };
GO_DATA_FIELDS[6][17] = { name: 'SummonerTriggered', tooltip: 'EMPTY' };
GO_DATA_FIELDS[6][18] = { name: 'requireLOS', tooltip: 'EMPTY' };

GO_DATA_FIELDS[7] = [];
GO_DATA_FIELDS[7][0] = { name: 'chairSlots', tooltip: 'GAMEOBJECT.TEMPLATE.CHAIR_SLOTS' };
GO_DATA_FIELDS[7][1] = { name: 'height', tooltip: 'EMPTY' };
GO_DATA_FIELDS[7][2] = { name: 'onlyCreatorUse', tooltip: 'EMPTY' };
GO_DATA_FIELDS[7][3] = { name: 'triggeredEvent', tooltip: 'EMPTY' };
GO_DATA_FIELDS[7][4] = { name: 'conditionID1', tooltip: 'EMPTY' };

GO_DATA_FIELDS[8] = [];
GO_DATA_FIELDS[8][0] = { name: 'spellFocusType', tooltip: 'GAMEOBJECT.TEMPLATE.SPELL_FOCUS_TYPE' };
GO_DATA_FIELDS[8][1] = { name: 'diameter', tooltip: 'GAMEOBJECT.TEMPLATE.RADIUS_2' };
GO_DATA_FIELDS[8][2] = { name: 'linkedTrap', tooltip: 'GAMEOBJECT.TEMPLATE.LINKED_TRAP' };
GO_DATA_FIELDS[8][3] = { name: 'serverOnly', tooltip: 'ALWAYS_0' };
GO_DATA_FIELDS[8][4] = { name: 'questID', tooltip: 'GAMEOBJECT.TEMPLATE.REQUIRED_ACTIVE_QUEST' };
GO_DATA_FIELDS[8][5] = { name: 'large', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[8][6] = { name: 'floatingTooltip', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[8][7] = { name: 'floatOnWater', tooltip: 'EMPTY' };
GO_DATA_FIELDS[8][8] = { name: 'conditionID1', tooltip: 'EMPTY' };

GO_DATA_FIELDS[9] = [];
GO_DATA_FIELDS[9][0] = { name: 'pageID', tooltip: 'GAMEOBJECT.TEMPLATE.PAGE_ID' };
GO_DATA_FIELDS[9][1] = { name: 'language', tooltip: 'GAMEOBJECT.TEMPLATE.FROM_LANGUAGE' };
GO_DATA_FIELDS[9][2] = { name: 'pageMaterial', tooltip: 'GAMEOBJECT.TEMPLATE.FROM_PAGE_MATERIAL' };
GO_DATA_FIELDS[9][3] = { name: 'allowMounted', tooltip: 'EMPTY' };
GO_DATA_FIELDS[9][4] = { name: 'conditionID1', tooltip: 'EMPTY' };
GO_DATA_FIELDS[9][5] = { name: 'NeverUsableWhileMounted', tooltip: 'EMPTY' };

GO_DATA_FIELDS[10] = [];
GO_DATA_FIELDS[10][0] = { name: 'open', tooltip: 'GAMEOBJECT.TEMPLATE.LOCK_ID_FROM_DBC' };
GO_DATA_FIELDS[10][1] = { name: 'questID', tooltip: 'GAMEOBJECT.TEMPLATE.REQUIRED_ACTIVE_QUEST' };
GO_DATA_FIELDS[10][2] = { name: 'eventID', tooltip: 'GAMEOBJECT.TEMPLATE.EVENT_ID' };
GO_DATA_FIELDS[10][3] = { name: 'Time', tooltip: 'GAMEOBJECT.TEMPLATE.TIME_MS_BEFORE_STATE' };
GO_DATA_FIELDS[10][4] = { name: 'customAnim', tooltip: 'UNKNOWN' };
GO_DATA_FIELDS[10][5] = { name: 'consumable', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG_SPAWN' };
GO_DATA_FIELDS[10][6] = { name: 'cooldown', tooltip: 'GAMEOBJECT.TEMPLATE.TIME_S' };
GO_DATA_FIELDS[10][7] = { name: 'pageID', tooltip: 'GAMEOBJECT.TEMPLATE.PAGE_ID' };
GO_DATA_FIELDS[10][8] = { name: 'language', tooltip: 'GAMEOBJECT.TEMPLATE.FROM_LANGUAGE' };
GO_DATA_FIELDS[10][9] = { name: 'pageMaterial', tooltip: 'GAMEOBJECT.TEMPLATE.FROM_PAGE_MATERIAL' };
GO_DATA_FIELDS[10][10] = { name: 'spell', tooltip: 'GAMEOBJECT.TEMPLATE.SPELL_ID_FROM_DBC' };
GO_DATA_FIELDS[10][11] = { name: 'noDamageImmune', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[10][12] = { name: 'linkedTrap', tooltip: 'GAMEOBJECT.TEMPLATE.LINKED_TRAP' };
GO_DATA_FIELDS[10][13] = { name: 'large', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[10][14] = { name: 'openTextID', tooltip: 'EMPTY' };
GO_DATA_FIELDS[10][15] = { name: 'closeTextID', tooltip: 'EMPTY' };
GO_DATA_FIELDS[10][16] = { name: 'losOK', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG_BG_RELATED' };
GO_DATA_FIELDS[10][17] = { name: '', tooltip: 'EMPTY' };
GO_DATA_FIELDS[10][18] = { name: '', tooltip: 'EMPTY' };
GO_DATA_FIELDS[10][19] = { name: 'gossipID', tooltip: 'GAMEOBJECT.TEMPLATE.CASTS_SPELL' };
GO_DATA_FIELDS[10][20] = { name: 'AllowMultiInteract', tooltip: 'EMPTY' };
GO_DATA_FIELDS[10][21] = { name: 'floatOnWater', tooltip: 'EMPTY' };
GO_DATA_FIELDS[10][22] = { name: 'conditionID1', tooltip: 'EMPTY' };
GO_DATA_FIELDS[10][23] = { name: 'playerCast', tooltip: 'EMPTY' };

GO_DATA_FIELDS[11] = [];
GO_DATA_FIELDS[11][0] = { name: 'Timeto2ndfloor', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][1] = { name: 'startOpen', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][2] = { name: 'autoClose', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][3] = { name: 'Reached1stfloor', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][4] = { name: 'Reached2ndfloor', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][5] = { name: 'SpawnMap', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][6] = { name: 'Timeto3rdfloor', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][7] = { name: 'Reached3rdfloor', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][8] = { name: 'Timeto4rdfloor', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][9] = { name: 'Reached4rdfloor', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][10] = { name: 'Timeto5rdfloor', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][11] = { name: 'Reached5rdfloor', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][12] = { name: 'Timeto6rdfloor', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][13] = { name: 'Reached6rdfloor', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][14] = { name: 'Timeto7rdfloor', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][15] = { name: 'Reached7rdfloor', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][16] = { name: 'Timeto8rdfloor', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][17] = { name: 'Reached8rdfloor', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][18] = { name: 'Timeto9rdfloor', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][19] = { name: 'Reached9rdfloor', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][20] = { name: 'Timeto10rdfloor', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][21] = { name: 'Reached10rdfloor', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][22] = { name: 'onlychargeheightcheck', tooltip: 'EMPTY' };
GO_DATA_FIELDS[11][23] = { name: 'onlychargetimecheck', tooltip: 'EMPTY' };

GO_DATA_FIELDS[12] = [];
GO_DATA_FIELDS[12][0] = { name: 'open', tooltip: 'EMPTY' };
GO_DATA_FIELDS[12][1] = { name: 'radius', tooltip: 'EMPTY' };
GO_DATA_FIELDS[12][2] = { name: 'damageMin', tooltip: 'EMPTY' };
GO_DATA_FIELDS[12][3] = { name: 'damageMax', tooltip: 'EMPTY' };
GO_DATA_FIELDS[12][4] = { name: 'damageSchool', tooltip: 'EMPTY' };
GO_DATA_FIELDS[12][5] = { name: 'autoClose', tooltip: 'EMPTY' };
GO_DATA_FIELDS[12][6] = { name: 'openTextID', tooltip: 'EMPTY' };
GO_DATA_FIELDS[12][7] = { name: 'closeTextID', tooltip: 'EMPTY' };

GO_DATA_FIELDS[13] = [];
GO_DATA_FIELDS[13][0] = { name: 'open', tooltip: 'GAMEOBJECT.TEMPLATE.LOCK_ID_FROM_DBC' };
GO_DATA_FIELDS[13][1] = { name: 'camera', tooltip: 'GAMEOBJECT.TEMPLATE.FROM_CINEMATIC' };
GO_DATA_FIELDS[13][2] = { name: 'eventID', tooltip: 'EMPTY' };
GO_DATA_FIELDS[13][3] = { name: 'openTextID', tooltip: 'EMPTY' };
GO_DATA_FIELDS[13][4] = { name: 'conditionID1', tooltip: 'EMPTY' };

GO_DATA_FIELDS[15] = [];
GO_DATA_FIELDS[15][0] = { name: 'taxiPathID', tooltip: 'GAMEOBJECT.TEMPLATE.FROM_TAXIPATH' };
GO_DATA_FIELDS[15][1] = { name: 'moveSpeed', tooltip: 'EMPTY' };
GO_DATA_FIELDS[15][2] = { name: 'accelRate', tooltip: 'EMPTY' };
GO_DATA_FIELDS[15][3] = { name: 'startEventID', tooltip: 'EMPTY' };
GO_DATA_FIELDS[15][4] = { name: 'stopEventID', tooltip: 'EMPTY' };
GO_DATA_FIELDS[15][5] = { name: 'transportPhysics', tooltip: 'EMPTY' };
GO_DATA_FIELDS[15][6] = { name: 'SpawnMap', tooltip: 'EMPTY' };
GO_DATA_FIELDS[15][7] = { name: 'worldState1', tooltip: 'EMPTY' };
GO_DATA_FIELDS[15][8] = { name: 'allowstopping', tooltip: 'EMPTY' };
GO_DATA_FIELDS[15][9] = { name: 'InitStopped', tooltip: 'EMPTY' };
GO_DATA_FIELDS[15][10] = { name: 'TrueInfiniteAOI', tooltip: 'EMPTY' };

GO_DATA_FIELDS[18] = [];
GO_DATA_FIELDS[18][0] = { name: 'casters', tooltip: 'EMPTY' };
GO_DATA_FIELDS[18][1] = { name: 'spell', tooltip: 'GAMEOBJECT.TEMPLATE.SPELL_ID_FROM_DBC' };
GO_DATA_FIELDS[18][2] = { name: 'animSpell', tooltip: 'GAMEOBJECT.TEMPLATE.SPELL_ID_FROM_DBC' };
GO_DATA_FIELDS[18][3] = { name: 'ritualPersistent', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[18][4] = { name: 'casterTargetSpell', tooltip: 'GAMEOBJECT.TEMPLATE.SPELL_ID_FROM_DBC' };
GO_DATA_FIELDS[18][5] = { name: 'casterTargetSpellTargets', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[18][6] = { name: 'castersGrouped', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[18][7] = { name: 'ritualNoTargetCheck', tooltip: 'EMPTY' };
GO_DATA_FIELDS[18][8] = { name: 'conditionID1', tooltip: 'EMPTY' };

GO_DATA_FIELDS[20] = [];
GO_DATA_FIELDS[20][0] = { name: 'actionHouseID', tooltip: 'GAMEOBJECT.TEMPLATE.FROM_AUCTIONHOUSE' };

GO_DATA_FIELDS[21] = [];
GO_DATA_FIELDS[21][0] = { name: 'CreatureID', tooltip: 'EMPTY' };
GO_DATA_FIELDS[21][1] = { name: 'unk', tooltip: 'EMPTY' };

GO_DATA_FIELDS[22] = [];
GO_DATA_FIELDS[22][0] = { name: 'spell', tooltip: 'GAMEOBJECT.TEMPLATE.SPELL_ID_FROM_DBC' };
GO_DATA_FIELDS[22][1] = { name: 'charges', tooltip: 'EMPTY' };
GO_DATA_FIELDS[22][2] = { name: 'partyOnly', tooltip: 'GAMEOBJECT.TEMPLATE.PARTY_ONLY' };
GO_DATA_FIELDS[22][3] = { name: 'allowMounted', tooltip: 'EMPTY' };
GO_DATA_FIELDS[22][4] = { name: 'GiganticAOI', tooltip: 'EMPTY' };
GO_DATA_FIELDS[22][5] = { name: 'conditionID1', tooltip: 'EMPTY' };
GO_DATA_FIELDS[22][6] = { name: 'playerCast', tooltip: 'EMPTY' };
GO_DATA_FIELDS[22][7] = { name: 'NeverUsableWhileMounted', tooltip: 'EMPTY' };

GO_DATA_FIELDS[23] = [];
GO_DATA_FIELDS[23][0] = { name: 'minLevel', tooltip: 'EMPTY' };
GO_DATA_FIELDS[23][1] = { name: 'maxLevel', tooltip: 'EMPTY' };
GO_DATA_FIELDS[23][2] = { name: 'areaID', tooltip: 'GAMEOBJECT.TEMPLATE.FROM_AREATABLE' };

GO_DATA_FIELDS[24] = [];
GO_DATA_FIELDS[24][0] = { name: 'open', tooltip: 'GAMEOBJECT.TEMPLATE.LOCK_ID_FROM_DBC' };
GO_DATA_FIELDS[24][1] = { name: 'pickupSpell', tooltip: 'GAMEOBJECT.TEMPLATE.SPELL_ID_FROM_DBC' };
GO_DATA_FIELDS[24][2] = { name: 'radius', tooltip: 'GAMEOBJECT.TEMPLATE.DISTANCE' };
GO_DATA_FIELDS[24][3] = { name: 'returnAura', tooltip: 'GAMEOBJECT.TEMPLATE.SPELL_ID_FROM_DBC' };
GO_DATA_FIELDS[24][4] = { name: 'returnSpell', tooltip: 'GAMEOBJECT.TEMPLATE.SPELL_ID_FROM_DBC' };
GO_DATA_FIELDS[24][5] = { name: 'noDamageImmune', tooltip: 'EMPTY' };
GO_DATA_FIELDS[24][6] = { name: 'openTextID', tooltip: 'EMPTY' };
GO_DATA_FIELDS[24][7] = { name: 'losOK', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[24][8] = { name: 'conditionID1', tooltip: 'EMPTY' };
GO_DATA_FIELDS[24][9] = { name: 'playerCast', tooltip: 'EMPTY' };
GO_DATA_FIELDS[24][10] = { name: 'GiganticAOI', tooltip: 'EMPTY' };
GO_DATA_FIELDS[24][11] = { name: 'InfiniteAOI', tooltip: 'EMPTY' };
GO_DATA_FIELDS[24][12] = { name: 'cooldown', tooltip: 'EMPTY' };

GO_DATA_FIELDS[25] = [];
GO_DATA_FIELDS[25][0] = { name: 'radius', tooltip: 'GAMEOBJECT.TEMPLATE.DISTANCE' };
GO_DATA_FIELDS[25][1] = { name: 'chestLoot', tooltip: 'GAMEOBJECT.TEMPLATE.ENTRY_FROM_GO_LOOT' };
GO_DATA_FIELDS[25][2] = { name: 'minRestock', tooltip: 'EMPTY' };
GO_DATA_FIELDS[25][3] = { name: 'maxRestock', tooltip: 'EMPTY' };
GO_DATA_FIELDS[25][4] = { name: 'open', tooltip: 'EMPTY' };

GO_DATA_FIELDS[26] = [];
GO_DATA_FIELDS[26][0] = { name: 'open', tooltip: 'GAMEOBJECT.TEMPLATE.LOCK_ID_FROM_DBC' };
GO_DATA_FIELDS[26][1] = { name: 'eventID', tooltip: 'GAMEOBJECT.TEMPLATE.UNKNOWN_ID' };
GO_DATA_FIELDS[26][2] = { name: 'pickupSpell', tooltip: 'GAMEOBJECT.TEMPLATE.SPELL_ID_FROM_DBC' };
GO_DATA_FIELDS[26][3] = { name: 'noDamageImmune', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[26][4] = { name: 'openTextID', tooltip: 'EMPTY' };
GO_DATA_FIELDS[26][5] = { name: 'playerCast', tooltip: 'EMPTY' };
GO_DATA_FIELDS[26][6] = { name: 'ExpireDuration', tooltip: 'EMPTY' };
GO_DATA_FIELDS[26][7] = { name: 'GiganticAOI', tooltip: 'EMPTY' };
GO_DATA_FIELDS[26][8] = { name: 'InfiniteAOI', tooltip: 'EMPTY' };
GO_DATA_FIELDS[26][9] = { name: 'cooldown', tooltip: 'EMPTY' };

GO_DATA_FIELDS[27] = [];
GO_DATA_FIELDS[27][0] = { name: 'teleportId', tooltip: 'GAMEOBJECT.TEMPLATE.TELEPORT_ID' };

GO_DATA_FIELDS[29] = [];
GO_DATA_FIELDS[29][0] = { name: 'radius', tooltip: 'GAMEOBJECT.TEMPLATE.DISTANCE' };
GO_DATA_FIELDS[29][1] = { name: 'spell', tooltip: 'GAMEOBJECT.TEMPLATE.SPELL_UNKNOWN_ID' };
GO_DATA_FIELDS[29][2] = { name: 'worldState1', tooltip: 'EMPTY' };
GO_DATA_FIELDS[29][3] = { name: 'worldstate2', tooltip: 'EMPTY' };
GO_DATA_FIELDS[29][4] = { name: 'winEventID1', tooltip: 'EMPTY' };
GO_DATA_FIELDS[29][5] = { name: 'winEventID2', tooltip: 'EMPTY' };
GO_DATA_FIELDS[29][6] = { name: 'contestedEventID1', tooltip: 'EMPTY' };
GO_DATA_FIELDS[29][7] = { name: 'contestedEventID2', tooltip: 'EMPTY' };
GO_DATA_FIELDS[29][8] = { name: 'progressEventID1', tooltip: 'EMPTY' };
GO_DATA_FIELDS[29][9] = { name: 'progressEventID2', tooltip: 'EMPTY' };
GO_DATA_FIELDS[29][10] = { name: 'neutralEventID1', tooltip: 'EMPTY' };
GO_DATA_FIELDS[29][11] = { name: 'neutralEventID2', tooltip: 'EMPTY' };
GO_DATA_FIELDS[29][12] = { name: 'neutralPercent', tooltip: 'EMPTY' };
GO_DATA_FIELDS[29][13] = { name: 'worldstate3', tooltip: 'EMPTY' };
GO_DATA_FIELDS[29][14] = { name: 'minSuperiority', tooltip: 'EMPTY' };
GO_DATA_FIELDS[29][15] = { name: 'maxSuperiority', tooltip: 'EMPTY' };
GO_DATA_FIELDS[29][16] = { name: 'minTime', tooltip: 'GAMEOBJECT.TEMPLATE.TIME_S' };
GO_DATA_FIELDS[29][17] = { name: 'maxTime', tooltip: 'GAMEOBJECT.TEMPLATE.TIME_S' };
GO_DATA_FIELDS[29][18] = { name: 'large', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[29][19] = { name: 'highlight', tooltip: 'EMPTY' };
GO_DATA_FIELDS[29][20] = { name: 'startingValue', tooltip: 'EMPTY' };
GO_DATA_FIELDS[29][21] = { name: 'unidirectional', tooltip: 'EMPTY' };
GO_DATA_FIELDS[29][22] = { name: 'killbonustime', tooltip: 'EMPTY' };
GO_DATA_FIELDS[29][23] = { name: 'speedWorldState1', tooltip: 'EMPTY' };

GO_DATA_FIELDS[30] = [];
GO_DATA_FIELDS[30][0] = { name: 'startOpen', tooltip: 'GAMEOBJECT.TEMPLATE.BOOLEAN_FLAG' };
GO_DATA_FIELDS[30][1] = { name: 'radius', tooltip: 'GAMEOBJECT.TEMPLATE.DISTANCE' };
GO_DATA_FIELDS[30][2] = { name: 'auraID1', tooltip: 'GAMEOBJECT.TEMPLATE.SPELL_ID_FROM_DBC' };
GO_DATA_FIELDS[30][3] = { name: 'conditionID1', tooltip: 'GAMEOBJECT.TEMPLATE.UNKNOWN_ID' };
GO_DATA_FIELDS[30][4] = { name: 'auraID2', tooltip: 'EMPTY' };
GO_DATA_FIELDS[30][5] = { name: 'conditionID2', tooltip: 'EMPTY' };
GO_DATA_FIELDS[30][6] = { name: 'serverOnly', tooltip: 'EMPTY' };

GO_DATA_FIELDS[31] = [];
GO_DATA_FIELDS[31][0] = { name: 'mapID', tooltip: 'GAMEOBJECT.TEMPLATE.FROM_MAP' };
GO_DATA_FIELDS[31][1] = { name: 'difficulty', tooltip: 'GAMEOBJECT.TEMPLATE.DIFFICULTY' };
GO_DATA_FIELDS[31][2] = { name: 'DifficultyHeroic', tooltip: 'EMPTY' };
GO_DATA_FIELDS[31][3] = { name: 'DifficultyEpic', tooltip: 'EMPTY' };
GO_DATA_FIELDS[31][4] = { name: 'DifficultyLegendary', tooltip: 'EMPTY' };
GO_DATA_FIELDS[31][5] = { name: 'HeroicAttachment', tooltip: 'EMPTY' };
GO_DATA_FIELDS[31][6] = { name: 'ChallengeAttachment', tooltip: 'EMPTY' };
GO_DATA_FIELDS[31][7] = { name: 'DifficultyAnimations', tooltip: 'EMPTY' };
GO_DATA_FIELDS[31][8] = { name: 'LargeAOI', tooltip: 'EMPTY' };
GO_DATA_FIELDS[31][9] = { name: 'GiganticAOI', tooltip: 'EMPTY' };
GO_DATA_FIELDS[31][10] = { name: 'Legacy', tooltip: 'EMPTY' };

GO_DATA_FIELDS[32] = [];
GO_DATA_FIELDS[32][0] = { name: 'chairheight', tooltip: 'EMPTY' };
GO_DATA_FIELDS[32][1] = { name: 'HeightOffset', tooltip: 'EMPTY' };
GO_DATA_FIELDS[32][2] = { name: 'SitAnimKit', tooltip: 'EMPTY' };

GO_DATA_FIELDS[33] = [];
GO_DATA_FIELDS[33][0] = { name: 'intactNumHits', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][1] = { name: 'creditProxyCreature', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][2] = { name: 'state1Name', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][3] = { name: 'intactEvent', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][4] = { name: 'damagedDisplayId', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][5] = { name: 'damagedNumHits', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][6] = { name: 'empty3', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][7] = { name: 'empty4', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][8] = { name: 'empty5', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][9] = { name: 'damagedEvent', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][10] = { name: 'destroyedDisplayId', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][11] = { name: 'empty7', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][12] = { name: 'empty8', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][13] = { name: 'empty9', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][14] = { name: 'destroyedEvent', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][15] = { name: 'empty10', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][16] = { name: 'debuildingTimeSecs', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][17] = { name: 'empty11', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][18] = { name: 'destructibleData', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][19] = { name: 'rebuildingEvent', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][20] = { name: 'empty12', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][21] = { name: 'empty13', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][22] = { name: 'damageEvent', tooltip: 'EMPTY' };
GO_DATA_FIELDS[33][23] = { name: 'empty14', tooltip: 'EMPTY' };

GO_DATA_FIELDS[35] = [];
GO_DATA_FIELDS[35][0] = { name: 'whenToPause', tooltip: 'EMPTY' };
GO_DATA_FIELDS[35][1] = { name: 'startOpen', tooltip: 'EMPTY' };
GO_DATA_FIELDS[35][2] = { name: 'autoClose', tooltip: 'EMPTY' };
GO_DATA_FIELDS[35][3] = { name: 'BlocksPathsDown', tooltip: 'EMPTY' };
GO_DATA_FIELDS[35][4] = { name: 'PathBlockerBump', tooltip: 'EMPTY' };
