export const UNIT_FLAGS = {
  NONE              : 0x00000000,
  SERVER_CONTROLLED : 0x00000001,
  NON_ATTACKABLE    : 0x00000002,
  DISABLE_MOVE      : 0x00000004,
  PVP_ATTACKABLE    : 0x00000008,
  RENAME            : 0x00000010,
  PREPARATION       : 0x00000020,
  UNK_6             : 0x00000040,
  NOT_ATTACKABLE_1  : 0x00000080,
  IMMUNE_TO_PC      : 0x00000100,
  IMMUNE_TO_NPC     : 0x00000200,
  LOOTING           : 0x00000400,
  PET_IN_COMBAT     : 0x00000800,
  PVP               : 0x00001000,
  SILENCED          : 0x00002000,
  UNK_14            : 0x00004000,
  UNK_15            : 0x00008000,
  UNK_16            : 0x00010000,
  PACIFIED          : 0x00020000,
  STUNNED           : 0x00040000,
  IN_COMBAT         : 0x00080000,
  TAXI_FLIGHT       : 0x00100000,
  DISARMED          : 0x00200000,
  CONFUSED          : 0x00400000,
  FLEEING           : 0x00800000,
  PLAYER_CONTROLLED : 0x01000000,
  NOT_SELECTABLE    : 0x02000000,
  SKINNABLE         : 0x04000000,
  MOUNT             : 0x08000000,
  UNK_28            : 0x10000000,
  UNK_29            : 0x20000000,
  SHEATHE           : 0x40000000,
};

export const unitFieldBytes1Type = {
  STAND_STAND_STATE_TYPE : 0,
  PET_TALENTS_TYPE       : 1,
  STAND_FLAGS_TYPE       : 2,
  BYTES1_FLAGS_TYPE      : 3,
};

export const NPC_FLAGS = {
  NONE               : 0x00000000,
  GOSSIP             : 0x00000001,
  QUESTGIVER         : 0x00000002,
  UNK1               : 0x00000004,
  UNK2               : 0x00000008,
  TRAINER            : 0x00000010,
  TRAINER_CLASS      : 0x00000020,
  TRAINER_PROFESSION : 0x00000040,
  VENDOR             : 0x00000080,
  VENDOR_AMMO        : 0x00000100,
  VENDOR_FOOD        : 0x00000200,
  VENDOR_POISON      : 0x00000400,
  VENDOR_REAGENT     : 0x00000800,
  REPAIR             : 0x00001000,
  FLIGHTMASTER       : 0x00002000,
  SPIRITHEALER       : 0x00004000,
  SPIRITGUIDE        : 0x00008000,
  INNKEEPER          : 0x00010000,
  BANKER             : 0x00020000,
  PETITIONER         : 0x00040000,
  TABARDDESIGNER     : 0x00080000,
  BATTLEMASTER       : 0x00100000,
  AUCTIONEER         : 0x00200000,
  STABLEMASTER       : 0x00400000,
  GUILD_BANKER       : 0x00800000,
  SPELLCLICK         : 0x01000000,
  PLAYER_VEHICLE     : 0x02000000,
};

export const templates = {
  BASIC           : 0,
  CASTER          : 1,
  TURRET          : 2,
  PASSIVE         : 3,
  CAGED_GO_PART   : 4,
  CAGED_NPC_PART  : 5,
};

export const GO_FLAGS = {
  NONE           : 0x00000000,
  IN_USE         : 0x00000001,
  LOCKED         : 0x00000002,
  INTERACT_COND  : 0x00000004,
  TRANSPORT      : 0x00000008,
  NOT_SELECTABLE : 0x00000010,
  NODESPAWN      : 0x00000020,
  TRIGGERED      : 0x00000040,
  DAMAGED        : 0x00000200,
  DESTROYED      : 0x00000400,
};

export const DYNAMIC_FLAGS = {
  NONE                      : 0x0000,
  LOOTABLE                  : 0x0001,
  TRACK_UNIT                : 0x0002,
  TAPPED                    : 0x0004,
  TAPPED_BY_PLAYER          : 0x0008,
  SPECIALINFO               : 0x0010,
  DEAD                      : 0x0020,
  REFER_A_FRIEND            : 0x0040,
  TAPPED_BY_ALL_THREAT_LIST : 0x0080
};

export const unitStandStateType = {
  STAND            : 0,
  SIT              : 1,
  SIT_CHAIR        : 2,
  SLEEP            : 3,
  SIT_LOW_CHAIR    : 4,
  SIT_MEDIUM_CHAIR : 5,
  SIT_HIGH_CHAIR   : 6,
  DEAD             : 7,
  KNEEL            : 8,
  SUBMERGED        : 9
};

export const unitStandFlags = {
  NONE        : 0x00,
  UNK1        : 0x01,
  CREEP       : 0x02,
  UNTRACKABLE : 0x04,
  UNK4        : 0x08,
  UNK5        : 0x10,
  ALL         : 0xFF
};

export const unitBytes1Flags = {
  ALWAYS_STAND : 0x01,
  HOVER        : 0x02,
  UNK_3        : 0x04,
  ALL          : 0xFF
};

export const EVENT_FLAGS = {
  NONE           : 0x00,
  NOT_REPEATABLE : 0x01,
  NORMAL_DUNGEON : 0x02,
  HEROIC_DUNGEON : 0x04,
  NORMAL_RAID    : 0x08,
  HEROIC_RAID    : 0x10,
  DEBUG_ONLY     : 0x80
};

export const phaseMask = {
  ALWAYS : 0x000,
  1      : 0x001,
  2      : 0x002,
  3      : 0x004,
  4      : 0x008,
  5      : 0x010,
  6      : 0x020,
  7      : 0x040,
  8      : 0x080,
  9      : 0x100
};
