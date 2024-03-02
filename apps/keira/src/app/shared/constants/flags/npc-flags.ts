import { Flag } from '@keira/acore-world-model';

export const NPC_FLAGS: Flag[] = [
  { bit: 0, name: 'GOSSIP - If creature has more gossip options, add this flag to bring up a menu.' },
  { bit: 1, name: 'QUESTGIVER - Any creature giving or taking quests needs to have this flag.' },
  { bit: 2, name: 'UNK1' },
  { bit: 3, name: 'UNK2' },
  { bit: 4, name: 'TRAINER - Allows the creature to have a trainer list to teach spells' },
  { bit: 5, name: 'TRAINER_CLASS' },
  { bit: 6, name: 'TRAINER_PROFESSION' },
  { bit: 7, name: 'VENDOR - Any creature selling items needs to have this flag.' },
  { bit: 8, name: 'VENDOR_AMMO' },
  { bit: 9, name: 'VENDOR_FOOD' },
  { bit: 10, name: 'VENDOR_POISON' },
  { bit: 11, name: 'VENDOR_REAGENT' },
  { bit: 12, name: 'REPAIR - Creatures with this flag can repair items.' },
  { bit: 13, name: 'FLIGHTMASTER - Any creature serving as flight master has this.' },
  { bit: 14, name: 'SPIRITHEALER - Makes the creature invisible to alive characters and has the resurrect function.' },
  { bit: 15, name: 'SPIRITGUIDE' },
  { bit: 16, name: 'INNKEEPER - Creatures with this flag can set hearthstone locations.' },
  { bit: 17, name: 'BANKER - Creatures with this flag can show the bank\n' },
  { bit: 18, name: 'PETITIONER' },
  { bit: 19, name: 'TABARDDESIGNER - Allows the designing of guild tabards.' },
  { bit: 20, name: 'BATTLEMASTER - Creatures with this flag port players to battlegrounds.' },
  { bit: 21, name: 'AUCTIONEER - Allows creature to display auction list.' },
  { bit: 22, name: 'STABLEMASTER - Has the option to stable pets for hunters.' },
  { bit: 23, name: 'GUILD_BANKER' },
  { bit: 24, name: 'SPELLCLICK - Needs data on npc_spellclick_spells table' },
  { bit: 25, name: 'PLAYER_VEHICLE - players with mounts that have vehicle data should have it set' },
  { bit: 26, name: 'MAILBOX - NPC will act like a mailbox (opens mailbox with right-click)' },
];
