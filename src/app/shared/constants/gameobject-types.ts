import { FieldDefinition } from '../types/general';

export const GO_DATA_FIELDS: FieldDefinition[][] = [];
GO_DATA_FIELDS[0] = [];
GO_DATA_FIELDS[0][0] = { name: 'startOpen', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[0][1] = { name: 'open', tooltip: 'LockId from Lock.dbc' };
GO_DATA_FIELDS[0][2] = { name: 'autoClose', tooltip: 'Time in milliseconds' };
GO_DATA_FIELDS[0][3] = { name: 'noDamageImmune', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[0][4] = { name: 'openTextID', tooltip: null };
GO_DATA_FIELDS[0][5] = { name: 'closeTextID', tooltip: null };
GO_DATA_FIELDS[0][6] = { name: 'ignored', tooltip: 'Is ignored by pathfinding' };
GO_DATA_FIELDS[0][7] = { name: 'conditionId1', tooltip: null };
GO_DATA_FIELDS[0][8] = { name: 'doorOpaque', tooltip: null };
GO_DATA_FIELDS[0][9] = { name: 'giganticAOI', tooltip: null };
GO_DATA_FIELDS[0][10] = { name: 'infinite AOI', tooltip: null };

GO_DATA_FIELDS[1] = [];
GO_DATA_FIELDS[1][0] = { name: 'startOpen', tooltip: 'State' };
GO_DATA_FIELDS[1][1] = { name: 'open', tooltip: 'LockId from Lock.dbc' };
GO_DATA_FIELDS[1][2] = { name: 'autoClose', tooltip: 'long unknown flag' };
GO_DATA_FIELDS[1][3] = { name: 'linkedTrap', tooltip: 'entry from table gameobject_template' };
GO_DATA_FIELDS[1][4] = { name: 'noDamageImmune', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[1][5] = { name: 'large', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[1][6] = { name: 'openTextID', tooltip: 'Unknown Text ID' };
GO_DATA_FIELDS[1][7] = { name: 'closeTextID', tooltip: 'Unknown Text ID' };
GO_DATA_FIELDS[1][8] = { name: 'losOK', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[1][9] = { name: 'Conditionid1', tooltip: null };

GO_DATA_FIELDS[2] = [];
GO_DATA_FIELDS[2][0] = { name: 'open', tooltip: 'LockId from Lock.dbc' };
GO_DATA_FIELDS[2][1] = { name: 'questList', tooltip: 'unknown ID' };
GO_DATA_FIELDS[2][2] = { name: 'pageMaterial', tooltip: 'PageTextMaterial.dbc' };
GO_DATA_FIELDS[2][3] = { name: 'gossipID', tooltip: 'menu_id from table gossip_menu_option' };
GO_DATA_FIELDS[2][4] = { name: 'customAnim', tooltip: 'unknown value from 1 to 4' };
GO_DATA_FIELDS[2][5] = { name: 'noDamageImmune', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[2][6] = { name: 'openTextID', tooltip: 'ID from table broadcast_text' };
GO_DATA_FIELDS[2][7] = { name: 'losOK', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[2][8] = { name: 'allowMounted', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[2][9] = { name: 'large', tooltip: null };
GO_DATA_FIELDS[2][10] = { name: 'Conditionid1', tooltip: null };
GO_DATA_FIELDS[2][11] = { name: 'mountForbidden', tooltip: 'Never usable while mounted' };

GO_DATA_FIELDS[3] = [];
GO_DATA_FIELDS[3][0] = { name: 'open', tooltip: 'LockId from Lock.dbc' };
GO_DATA_FIELDS[3][1] = { name: 'chestLoot', tooltip: 'entry from table gameobject_loot_template' };
GO_DATA_FIELDS[3][2] = { name: 'chestRestockTime', tooltip: 'time in seconds' };
GO_DATA_FIELDS[3][3] = { name: 'consumable', tooltip: 'State: Boolean flag' };
GO_DATA_FIELDS[3][4] = { name: 'minRestock', tooltip: 'Min successful loot attempts for Mining, Herbalism etc' };
GO_DATA_FIELDS[3][5] = { name: 'maxRestock', tooltip: 'Max successful loot attempts for Mining, Herbalism etc' };
GO_DATA_FIELDS[3][6] = { name: 'lootedEvent', tooltip: 'Event ID from table event_scripts)' };
GO_DATA_FIELDS[3][7] = { name: 'linkedTrap', tooltip: 'entry from table gameobject_loot_template' };
GO_DATA_FIELDS[3][8] = { name: 'questID', tooltip: 'ID from quest_template' };
GO_DATA_FIELDS[3][9] = { name: 'level', tooltip: 'minimal level required to open this gameobject' };
GO_DATA_FIELDS[3][10] = { name: 'losOK', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[3][11] = { name: 'leaveLoot', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[3][12] = { name: 'notInCombat', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[3][13] = { name: 'logLoot', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[3][14] = { name: 'openTextID', tooltip: null };
GO_DATA_FIELDS[3][15] = { name: 'useGroupLootRules', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[3][16] = { name: 'floatingTooltip', tooltip: null };
GO_DATA_FIELDS[3][17] = { name: 'conditionid1', tooltip: null };
GO_DATA_FIELDS[3][18] = { name: 'xplevel', tooltip: null };
GO_DATA_FIELDS[3][19] = { name: 'xpDifficulty', tooltip: null };
GO_DATA_FIELDS[3][20] = { name: 'lootlevel', tooltip: null };
GO_DATA_FIELDS[3][21] = { name: 'Group', tooltip: null };
GO_DATA_FIELDS[3][22] = { name: 'Damage', tooltip: 'Xp' };
GO_DATA_FIELDS[3][23] = { name: 'trivialSkillLow', tooltip: 'Immune' };

GO_DATA_FIELDS[5] = [];
GO_DATA_FIELDS[5][0] = { name: 'floatingTooltip', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[5][1] = { name: 'highlight', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[5][2] = { name: 'serverOnly', tooltip: 'Always 0' };
GO_DATA_FIELDS[5][3] = { name: 'large', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[5][4] = { name: 'floatOnWater', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[5][5] = { name: 'questID', tooltip: 'Required active quest_template.id to work' };
GO_DATA_FIELDS[5][6] = { name: 'conditionID1', tooltip: null };
GO_DATA_FIELDS[5][7] = { name: 'LargeAOI', tooltip: null };
GO_DATA_FIELDS[5][8] = { name: 'UseGarrisonOwnerGuildColors', tooltip: null };

GO_DATA_FIELDS[6] = [];
GO_DATA_FIELDS[6][0] = { name: 'open', tooltip: 'LockId from Lock.dbc ' };
GO_DATA_FIELDS[6][1] = { name: 'level', tooltip: 'npc equivalent level for casted spell' };
GO_DATA_FIELDS[6][2] = { name: 'diameter', tooltip: 'so radius * 2' };
GO_DATA_FIELDS[6][3] = { name: 'spell', tooltip: 'Spell Id from Spell.dbc' };
GO_DATA_FIELDS[6][4] = {
  name: 'type',
  tooltip: '0 trap with no despawn after cast. 1 trap despawns after cast. 2 bomb casts on spawn',
};
GO_DATA_FIELDS[6][5] = { name: 'cooldown', tooltip: 'time in seconds' };
GO_DATA_FIELDS[6][6] = { name: '?', tooltip: 'unknown flag' };
GO_DATA_FIELDS[6][7] = { name: 'startDelay', tooltip: 'time in seconds' };
GO_DATA_FIELDS[6][8] = { name: 'serverOnly', tooltip: 'always 0' };
GO_DATA_FIELDS[6][9] = { name: 'stealthed', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[6][10] = { name: 'large', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[6][11] = { name: 'invisible', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[6][12] = { name: 'openTextID', tooltip: 'Unknown ID' };
GO_DATA_FIELDS[6][13] = { name: 'closeTextID', tooltip: null };
GO_DATA_FIELDS[6][14] = { name: 'IgnoreTotems', tooltip: null };
GO_DATA_FIELDS[6][15] = { name: 'conditionID1', tooltip: null };
GO_DATA_FIELDS[6][16] = { name: 'playerCast', tooltip: null };
GO_DATA_FIELDS[6][17] = { name: 'SummonerTriggered', tooltip: null };
GO_DATA_FIELDS[6][18] = { name: 'requireLOS', tooltip: null };

GO_DATA_FIELDS[7] = [];
GO_DATA_FIELDS[7][0] = { name: 'chairSlots', tooltip: 'number of players that can sit down on it' };
GO_DATA_FIELDS[7][1] = { name: 'height', tooltip: 'null' };
GO_DATA_FIELDS[7][2] = { name: 'onlyCreatorUse', tooltip: null };
GO_DATA_FIELDS[7][3] = { name: 'triggeredEvent', tooltip: null };
GO_DATA_FIELDS[7][4] = { name: 'conditionID1', tooltip: null };

GO_DATA_FIELDS[8] = [];
GO_DATA_FIELDS[8][0] = {
  name: 'spellFocusType',
  tooltip: 'from SpellFocusObject.dbc; value also appears as RequiresSpellFocus in Spell.dbc',
};
GO_DATA_FIELDS[8][1] = { name: 'diameter', tooltip: 'so radius*2' };
GO_DATA_FIELDS[8][2] = { name: 'linkedTrap', tooltip: 'entry from table gameobject_template' };
GO_DATA_FIELDS[8][3] = { name: 'serverOnly', tooltip: 'Always 0' };
GO_DATA_FIELDS[8][4] = { name: 'questID', tooltip: 'Required active quest_template.id to work)' };
GO_DATA_FIELDS[8][5] = { name: 'large', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[8][6] = { name: 'floatingTooltip', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[8][7] = { name: 'floatOnWater', tooltip: null };
GO_DATA_FIELDS[8][8] = { name: 'conditionID1', tooltip: null };

GO_DATA_FIELDS[9] = [];
GO_DATA_FIELDS[9][0] = { name: 'pageID', tooltip: 'from table page_text.entry' };
GO_DATA_FIELDS[9][1] = { name: 'language', tooltip: 'from  Languages.dbc' };
GO_DATA_FIELDS[9][2] = { name: 'pageMaterial', tooltip: 'from PageTextMaterial.dbc' };
GO_DATA_FIELDS[9][3] = { name: 'allowMounted', tooltip: null };
GO_DATA_FIELDS[9][4] = { name: 'conditionID1', tooltip: null };
GO_DATA_FIELDS[9][5] = { name: 'NeverUsableWhileMounted', tooltip: null };

GO_DATA_FIELDS[10] = [];
GO_DATA_FIELDS[10][0] = { name: 'open', tooltip: 'LockId from Lock.dbc)' };
GO_DATA_FIELDS[10][1] = { name: 'questID', tooltip: 'Required active quest_template.id to work' };
GO_DATA_FIELDS[10][2] = { name: 'eventID', tooltip: 'id from table event_script' };
GO_DATA_FIELDS[10][3] = { name: 'Time', tooltip: 'in ms before the initial state is restored' };
GO_DATA_FIELDS[10][4] = { name: 'customAnim', tooltip: 'unknown' };
GO_DATA_FIELDS[10][5] = { name: 'consumable', tooltip: 'Boolean flag controling if gameobject will despawn or not' };
GO_DATA_FIELDS[10][6] = { name: 'cooldown', tooltip: 'time is seconds)' };
GO_DATA_FIELDS[10][7] = { name: 'pageID', tooltip: 'entry in table page_text' };
GO_DATA_FIELDS[10][8] = { name: 'language', tooltip: 'from Languages.dbc' };
GO_DATA_FIELDS[10][9] = { name: 'pageMaterial', tooltip: 'from PageTextMaterial.dbc' };
GO_DATA_FIELDS[10][10] = { name: 'spell', tooltip: 'Spell Id from Spell.dbc' };
GO_DATA_FIELDS[10][11] = { name: 'noDamageImmune', tooltip: 'Boolean flag)' };
GO_DATA_FIELDS[10][12] = { name: 'linkedTrap', tooltip: 'entry from table gameobject_template' };
GO_DATA_FIELDS[10][13] = { name: 'large', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[10][14] = { name: 'openTextID', tooltip: null };
GO_DATA_FIELDS[10][15] = { name: 'closeTextID', tooltip: null };
GO_DATA_FIELDS[10][16] = { name: 'losOK', tooltip: 'Boolean flag (somewhat related to battlegrounds)' };
GO_DATA_FIELDS[10][17] = { name: null, tooltip: null };
GO_DATA_FIELDS[10][18] = { name: null, tooltip: null };
GO_DATA_FIELDS[10][19] = { name: 'gossipID', tooltip: 'casts the spell when used' };
GO_DATA_FIELDS[10][20] = { name: 'AllowMultiInteract', tooltip: null };
GO_DATA_FIELDS[10][21] = { name: 'floatOnWater', tooltip: null };
GO_DATA_FIELDS[10][22] = { name: 'conditionID1', tooltip: null };
GO_DATA_FIELDS[10][23] = { name: 'playerCast', tooltip: null };

GO_DATA_FIELDS[11] = [];
GO_DATA_FIELDS[11][0] = { name: 'Timeto2ndfloor', tooltip: null };
GO_DATA_FIELDS[11][1] = { name: 'startOpen', tooltip: null };
GO_DATA_FIELDS[11][2] = { name: 'autoClose', tooltip: null };
GO_DATA_FIELDS[11][3] = { name: 'Reached1stfloor', tooltip: null };
GO_DATA_FIELDS[11][4] = { name: 'Reached2ndfloor', tooltip: null };
GO_DATA_FIELDS[11][5] = { name: 'SpawnMap', tooltip: null };
GO_DATA_FIELDS[11][6] = { name: 'Timeto3rdfloor', tooltip: null };
GO_DATA_FIELDS[11][7] = { name: 'Reached3rdfloor', tooltip: null };
GO_DATA_FIELDS[11][8] = { name: 'Timeto4rdfloor', tooltip: null };
GO_DATA_FIELDS[11][9] = { name: 'Reached4rdfloor', tooltip: null };
GO_DATA_FIELDS[11][10] = { name: 'Timeto5rdfloor', tooltip: null };
GO_DATA_FIELDS[11][11] = { name: 'Reached5rdfloor', tooltip: null };
GO_DATA_FIELDS[11][12] = { name: 'Timeto6rdfloor', tooltip: null };
GO_DATA_FIELDS[11][13] = { name: 'Reached6rdfloor', tooltip: null };
GO_DATA_FIELDS[11][14] = { name: 'Timeto7rdfloor', tooltip: null };
GO_DATA_FIELDS[11][15] = { name: 'Reached7rdfloor', tooltip: null };
GO_DATA_FIELDS[11][16] = { name: 'Timeto8rdfloor', tooltip: null };
GO_DATA_FIELDS[11][17] = { name: 'Reached8rdfloor', tooltip: null };
GO_DATA_FIELDS[11][18] = { name: 'Timeto9rdfloor', tooltip: null };
GO_DATA_FIELDS[11][19] = { name: 'Reached9rdfloor', tooltip: null };
GO_DATA_FIELDS[11][20] = { name: 'Timeto10rdfloor', tooltip: null };
GO_DATA_FIELDS[11][21] = { name: 'Reached10rdfloor', tooltip: null };
GO_DATA_FIELDS[11][22] = { name: 'onlychargeheightcheck', tooltip: null };
GO_DATA_FIELDS[11][23] = { name: 'onlychargetimecheck', tooltip: null };

GO_DATA_FIELDS[12] = [];
GO_DATA_FIELDS[12][0] = { name: 'open', tooltip: null };
GO_DATA_FIELDS[12][1] = { name: 'radius', tooltip: null };
GO_DATA_FIELDS[12][2] = { name: 'damageMin', tooltip: null };
GO_DATA_FIELDS[12][3] = { name: 'damageMax', tooltip: null };
GO_DATA_FIELDS[12][4] = { name: 'damageSchool', tooltip: null };
GO_DATA_FIELDS[12][5] = { name: 'autoClose', tooltip: null };
GO_DATA_FIELDS[12][6] = { name: 'openTextID', tooltip: null };
GO_DATA_FIELDS[12][7] = { name: 'closeTextID', tooltip: null };

GO_DATA_FIELDS[13] = [];
GO_DATA_FIELDS[13][0] = { name: 'open', tooltip: 'LockId from Lock.dbc' };
GO_DATA_FIELDS[13][1] = { name: 'camera', tooltip: 'Cinematic entry from CinematicCamera.dbc' };
GO_DATA_FIELDS[13][2] = { name: 'eventID', tooltip: null };
GO_DATA_FIELDS[13][3] = { name: 'openTextID', tooltip: null };
GO_DATA_FIELDS[13][4] = { name: 'conditionID1', tooltip: null };

GO_DATA_FIELDS[15] = [];
GO_DATA_FIELDS[15][0] = { name: 'taxiPathID', tooltip: 'Id from TaxiPath.dbc' };
GO_DATA_FIELDS[15][1] = { name: 'moveSpeed', tooltip: null };
GO_DATA_FIELDS[15][2] = { name: 'accelRate', tooltip: null };
GO_DATA_FIELDS[15][3] = { name: 'startEventID', tooltip: null };
GO_DATA_FIELDS[15][4] = { name: 'stopEventID', tooltip: null };
GO_DATA_FIELDS[15][5] = { name: 'transportPhysics', tooltip: null };
GO_DATA_FIELDS[15][6] = { name: 'SpawnMap', tooltip: null };
GO_DATA_FIELDS[15][7] = { name: 'worldState1', tooltip: null };
GO_DATA_FIELDS[15][8] = { name: 'allowstopping', tooltip: null };
GO_DATA_FIELDS[15][9] = { name: 'InitStopped', tooltip: null };
GO_DATA_FIELDS[15][10] = { name: 'TrueInfiniteAOI', tooltip: null };

GO_DATA_FIELDS[18] = [];
GO_DATA_FIELDS[18][0] = { name: 'casters', tooltip: null };
GO_DATA_FIELDS[18][1] = { name: 'spell', tooltip: 'Spell Id from Spell.dbc' };
GO_DATA_FIELDS[18][2] = { name: 'animSpell', tooltip: 'Spell Id from Spell.dbc' };
GO_DATA_FIELDS[18][3] = { name: 'ritualPersistent', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[18][4] = { name: 'casterTargetSpell', tooltip: 'Spell Id from Spell.dbc' };
GO_DATA_FIELDS[18][5] = { name: 'casterTargetSpellTargets', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[18][6] = { name: 'castersGrouped', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[18][7] = { name: 'ritualNoTargetCheck', tooltip: null };
GO_DATA_FIELDS[18][8] = { name: 'conditionID1', tooltip: null };

GO_DATA_FIELDS[20] = [];
GO_DATA_FIELDS[20][0] = { name: 'actionHouseID', tooltip: 'From AuctionHouse.dbc' };

GO_DATA_FIELDS[21] = [];
GO_DATA_FIELDS[21][0] = { name: 'CreatureID', tooltip: null };
GO_DATA_FIELDS[21][1] = { name: 'unk', tooltip: null };

GO_DATA_FIELDS[22] = [];
GO_DATA_FIELDS[22][0] = { name: 'spell', tooltip: 'Spell Id from Spell.dbc' };
GO_DATA_FIELDS[22][1] = { name: 'charges', tooltip: null };
GO_DATA_FIELDS[22][2] = { name: 'partyOnly', tooltip: 'Boolean flag, need to be in group to use it' };
GO_DATA_FIELDS[22][3] = { name: 'allowMounted', tooltip: null };
GO_DATA_FIELDS[22][4] = { name: 'GiganticAOI', tooltip: null };
GO_DATA_FIELDS[22][5] = { name: 'conditionID1', tooltip: null };
GO_DATA_FIELDS[22][6] = { name: 'playerCast', tooltip: null };
GO_DATA_FIELDS[22][7] = { name: 'NeverUsableWhileMounted', tooltip: null };

GO_DATA_FIELDS[23] = [];
GO_DATA_FIELDS[23][0] = { name: 'minLevel', tooltip: null };
GO_DATA_FIELDS[23][1] = { name: 'maxLevel', tooltip: null };
GO_DATA_FIELDS[23][2] = { name: 'areaID', tooltip: 'From AreaTable.dbc' };

GO_DATA_FIELDS[24] = [];
GO_DATA_FIELDS[24][0] = { name: 'open', tooltip: 'LockId from Lock.dbc' };
GO_DATA_FIELDS[24][1] = { name: 'pickupSpell', tooltip: 'Spell Id from Spell.dbc' };
GO_DATA_FIELDS[24][2] = { name: 'radius', tooltip: 'distance' };
GO_DATA_FIELDS[24][3] = { name: 'returnAura', tooltip: 'Spell Id from Spell.dbc' };
GO_DATA_FIELDS[24][4] = { name: 'returnSpell', tooltip: 'Spell Id from Spell.dbc' };
GO_DATA_FIELDS[24][5] = { name: 'noDamageImmune', tooltip: null };
GO_DATA_FIELDS[24][6] = { name: 'openTextID', tooltip: null };
GO_DATA_FIELDS[24][7] = { name: 'losOK', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[24][8] = { name: 'conditionID1', tooltip: null };
GO_DATA_FIELDS[24][9] = { name: 'playerCast', tooltip: null };
GO_DATA_FIELDS[24][10] = { name: 'GiganticAOI', tooltip: null };
GO_DATA_FIELDS[24][11] = { name: 'InfiniteAOI', tooltip: null };
GO_DATA_FIELDS[24][12] = { name: 'cooldown', tooltip: null };

GO_DATA_FIELDS[25] = [];
GO_DATA_FIELDS[25][0] = { name: 'radius', tooltip: 'Distance' };
GO_DATA_FIELDS[25][1] = { name: 'chestLoot', tooltip: 'Entry from table gameobject_loot_template' };
GO_DATA_FIELDS[25][2] = { name: 'minRestock', tooltip: null };
GO_DATA_FIELDS[25][3] = { name: 'maxRestock', tooltip: null };
GO_DATA_FIELDS[25][4] = { name: 'open', tooltip: null };

GO_DATA_FIELDS[26] = [];
GO_DATA_FIELDS[26][0] = { name: 'open', tooltip: 'LockId from Lock.dbc' };
GO_DATA_FIELDS[26][1] = { name: 'eventID', tooltip: 'Unknown Event ID' };
GO_DATA_FIELDS[26][2] = { name: 'pickupSpell', tooltip: 'Spell Id from Spell.dbc' };
GO_DATA_FIELDS[26][3] = { name: 'noDamageImmune', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[26][4] = { name: 'openTextID', tooltip: null };
GO_DATA_FIELDS[26][5] = { name: 'playerCast', tooltip: null };
GO_DATA_FIELDS[26][6] = { name: 'ExpireDuration', tooltip: null };
GO_DATA_FIELDS[26][7] = { name: 'GiganticAOI', tooltip: null };
GO_DATA_FIELDS[26][8] = { name: 'InfiniteAOI', tooltip: null };
GO_DATA_FIELDS[26][9] = { name: 'cooldown', tooltip: null };

GO_DATA_FIELDS[27] = [];
GO_DATA_FIELDS[27][0] = { name: 'teleportId', tooltip: 'id from table areatrigger_teleport' };

GO_DATA_FIELDS[29] = [];
GO_DATA_FIELDS[29][0] = { name: 'radius', tooltip: 'Distance' };
GO_DATA_FIELDS[29][1] = {
  name: 'spell',
  tooltip: 'Unknown ID, not a spell id in dbc file, maybe server only side spell',
};
GO_DATA_FIELDS[29][2] = { name: 'worldState1', tooltip: null };
GO_DATA_FIELDS[29][3] = { name: 'worldstate2', tooltip: null };
GO_DATA_FIELDS[29][4] = { name: 'winEventID1', tooltip: null };
GO_DATA_FIELDS[29][5] = { name: 'winEventID2', tooltip: null };
GO_DATA_FIELDS[29][6] = { name: 'contestedEventID1', tooltip: null };
GO_DATA_FIELDS[29][7] = { name: 'contestedEventID2', tooltip: null };
GO_DATA_FIELDS[29][8] = { name: 'progressEventID1', tooltip: null };
GO_DATA_FIELDS[29][9] = { name: 'progressEventID2', tooltip: null };
GO_DATA_FIELDS[29][10] = { name: 'neutralEventID1', tooltip: null };
GO_DATA_FIELDS[29][11] = { name: 'neutralEventID2', tooltip: null };
GO_DATA_FIELDS[29][12] = { name: 'neutralPercent', tooltip: null };
GO_DATA_FIELDS[29][13] = { name: 'worldstate3', tooltip: null };
GO_DATA_FIELDS[29][14] = { name: 'minSuperiority', tooltip: null };
GO_DATA_FIELDS[29][15] = { name: 'maxSuperiority', tooltip: null };
GO_DATA_FIELDS[29][16] = { name: 'minTime', tooltip: 'in seconds' };
GO_DATA_FIELDS[29][17] = { name: 'maxTime', tooltip: 'in seconds' };
GO_DATA_FIELDS[29][18] = { name: 'large', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[29][19] = { name: 'highlight', tooltip: null };
GO_DATA_FIELDS[29][20] = { name: 'startingValue', tooltip: null };
GO_DATA_FIELDS[29][21] = { name: 'unidirectional', tooltip: null };
GO_DATA_FIELDS[29][22] = { name: 'killbonustime', tooltip: null };
GO_DATA_FIELDS[29][23] = { name: 'speedWorldState1', tooltip: null };

GO_DATA_FIELDS[30] = [];
GO_DATA_FIELDS[30][0] = { name: 'startOpen', tooltip: 'Boolean flag' };
GO_DATA_FIELDS[30][1] = { name: 'radius', tooltip: 'Distance' };
GO_DATA_FIELDS[30][2] = { name: 'auraID1', tooltip: 'Spell Id from Spell.dbc' };
GO_DATA_FIELDS[30][3] = { name: 'conditionID1', tooltip: 'Unknown ID' };
GO_DATA_FIELDS[30][4] = { name: 'auraID2', tooltip: null };
GO_DATA_FIELDS[30][5] = { name: 'conditionID2', tooltip: null };
GO_DATA_FIELDS[30][6] = { name: 'serverOnly', tooltip: null };

GO_DATA_FIELDS[31] = [];
GO_DATA_FIELDS[31][0] = { name: 'mapID', tooltip: 'From Map.dbc' };
GO_DATA_FIELDS[31][1] = {
  name: 'difficulty',
  tooltip: '0=(5 and 10 man normal); 1=(5 man heroic, 25 normal); 2=(10 man heroic); 3=(25 man heroic)',
};
GO_DATA_FIELDS[31][2] = { name: 'DifficultyHeroic', tooltip: null };
GO_DATA_FIELDS[31][3] = { name: 'DifficultyEpic', tooltip: null };
GO_DATA_FIELDS[31][4] = { name: 'DifficultyLegendary', tooltip: null };
GO_DATA_FIELDS[31][5] = { name: 'HeroicAttachment', tooltip: null };
GO_DATA_FIELDS[31][6] = { name: 'ChallengeAttachment', tooltip: null };
GO_DATA_FIELDS[31][7] = { name: 'DifficultyAnimations', tooltip: null };
GO_DATA_FIELDS[31][8] = { name: 'LargeAOI', tooltip: null };
GO_DATA_FIELDS[31][9] = { name: 'GiganticAOI', tooltip: null };
GO_DATA_FIELDS[31][10] = { name: 'Legacy', tooltip: null };

GO_DATA_FIELDS[32] = [];
GO_DATA_FIELDS[32][0] = { name: 'chairheight', tooltip: null };
GO_DATA_FIELDS[32][1] = { name: 'HeightOffset', tooltip: null };
GO_DATA_FIELDS[32][2] = { name: 'SitAnimKit', tooltip: null };

GO_DATA_FIELDS[33] = [];
GO_DATA_FIELDS[33][0] = { name: 'intactNumHits', tooltip: null };
GO_DATA_FIELDS[33][1] = { name: 'creditProxyCreature', tooltip: null };
GO_DATA_FIELDS[33][2] = { name: 'state1Name', tooltip: null };
GO_DATA_FIELDS[33][3] = { name: 'intactEvent', tooltip: null };
GO_DATA_FIELDS[33][4] = { name: 'damagedDisplayId', tooltip: null };
GO_DATA_FIELDS[33][5] = { name: 'damagedNumHits', tooltip: null };
GO_DATA_FIELDS[33][6] = { name: 'empty3', tooltip: null };
GO_DATA_FIELDS[33][7] = { name: 'empty4', tooltip: null };
GO_DATA_FIELDS[33][8] = { name: 'empty5', tooltip: null };
GO_DATA_FIELDS[33][9] = { name: 'damagedEvent', tooltip: null };
GO_DATA_FIELDS[33][10] = { name: 'destroyedDisplayId', tooltip: null };
GO_DATA_FIELDS[33][11] = { name: 'empty7', tooltip: null };
GO_DATA_FIELDS[33][12] = { name: 'empty8', tooltip: null };
GO_DATA_FIELDS[33][13] = { name: 'empty9', tooltip: null };
GO_DATA_FIELDS[33][14] = { name: 'destroyedEvent', tooltip: null };
GO_DATA_FIELDS[33][15] = { name: 'empty10', tooltip: null };
GO_DATA_FIELDS[33][16] = { name: 'debuildingTimeSecs', tooltip: null };
GO_DATA_FIELDS[33][17] = { name: 'empty11', tooltip: null };
GO_DATA_FIELDS[33][18] = { name: 'destructibleData', tooltip: null };
GO_DATA_FIELDS[33][19] = { name: 'rebuildingEvent', tooltip: null };
GO_DATA_FIELDS[33][20] = { name: 'empty12', tooltip: null };
GO_DATA_FIELDS[33][21] = { name: 'empty13', tooltip: null };
GO_DATA_FIELDS[33][22] = { name: 'damageEvent', tooltip: null };
GO_DATA_FIELDS[33][23] = { name: 'empty14', tooltip: null };

GO_DATA_FIELDS[35] = [];
GO_DATA_FIELDS[35][0] = { name: 'whenToPause', tooltip: null };
GO_DATA_FIELDS[35][1] = { name: 'startOpen', tooltip: null };
GO_DATA_FIELDS[35][2] = { name: 'autoClose', tooltip: null };
GO_DATA_FIELDS[35][3] = { name: 'BlocksPathsDown', tooltip: null };
GO_DATA_FIELDS[35][4] = { name: 'PathBlockerBump', tooltip: null };
