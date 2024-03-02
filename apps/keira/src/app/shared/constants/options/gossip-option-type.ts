import { Option } from '@keira/acore-world-model';

export const OPTION_TYPE: Option[] = [
  { value: 0, name: 'NONE - UNIT_NPC_FLAG_NONE (npcflag=0)' },
  { value: 1, name: 'GOSSIP - UNIT_NPC_FLAG_GOSSIP (npcflag=1)' },
  { value: 2, name: 'QUESTGIVER - UNIT_NPC_FLAG_QUESTGIVER (npcflag=2)' },
  {
    value: 3,
    name: 'VENDOR - UNIT_NPC_FLAG_VENDOR (Make sure there is npc_vendor data for this creature) (npcflag=128)',
  },
  { value: 4, name: 'TAXIVENDOR - UNIT_NPC_FLAG_TAXIVENDOR (npcflag=8192)' },
  {
    value: 5,
    name: 'TRAINE - UNIT_NPC_FLAG_TRAINER (Remember to set trainer_class in creature_template) (npcflag=16)',
  },
  { value: 6, name: 'SPIRITHEALER - UNIT_NPC_FLAG_SPIRITHEALER (npcflag=16384)' },
  { value: 7, name: 'SPIRITGUID - UNIT_NPC_FLAG_SPIRITGUIDE (npcflag=32768)' },
  { value: 8, name: 'INNKEEPE - UNIT_NPC_FLAG_INNKEEPER (npcflag=65536)' },
  { value: 9, name: 'BANKER - UNIT_NPC_FLAG_BANKER (npcflag=131072)' },
  { value: 10, name: 'PETITIONER - UNIT_NPC_FLAG_PETITIONER (npcflag=262144)' },
  { value: 11, name: 'TABARDDESIGNER - UNIT_NPC_FLAG_TABARDDESIGNER (npcflag=524288)' },
  { value: 12, name: 'BATTLEFIEL - UNIT_NPC_FLAG_BATTLEFIELDPERSON (npcflag=1048576)' },
  { value: 13, name: 'AUCTIONEER - UNIT_NPC_FLAG_AUCTIONEER (npcflag=2097152)' },
  { value: 14, name: 'STABLEPE - UNIT_NPC_FLAG_STABLE (npcflag=4194304)' },
  { value: 15, name: 'ARMORE - UNIT_NPC_FLAG_ARMORER (not used) (npcflag=4096)' },
  { value: 16, name: 'UNLEARNTALENTS - UNIT_NPC_FLAG_TRAINER (bonus option for OPTION_TRAINER) (npcflag=16)' },
  { value: 17, name: 'UNLEARNPETTALENT - UNIT_NPC_FLAG_TRAINER (bonus option for OPTION_TRAINER) (npcflag=16)' },
  { value: 18, name: 'LEARNDUALSPE - UNIT_NPC_FLAG_TRAINER (bonus option for OPTION_TRAINER) (npcflag=16)' },
  { value: 19, name: 'OUTDOORPVP - Added by code (option for outdoor PvP creatures)' },
];
