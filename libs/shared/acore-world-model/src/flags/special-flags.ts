import { Flag } from '@keira/shared/constants';

export const SPECIAL_FLAGS: Flag[] = [
  { bit: 0, name: 'Makes the quest repeatable' },
  { bit: 1, name: 'Makes the quest only completable by some external event' },
  { bit: 2, name: 'Make quest auto-accept (only quests in the starter area need this flag)' },
  { bit: 3, name: 'Only used for Dungeon Finder quests' },
  { bit: 4, name: 'Makes the quest monthly' },
  { bit: 5, name: 'The quest requires RequiredOrNpcGo killcredit (a spell cast), but NOT an actual NPC kill' },
  { bit: 6, name: 'Makes quest not share rewarded reputation with other allied factions' },
  {
    bit: 7,
    name: 'Allows quest to fail in Player::FailQuest() independant of its current state, e.g. relevant for timed quests that are completed right from the beginning.',
  },
];
