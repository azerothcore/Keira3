import { Option } from '@keira/shared/constants';

// ConditionValue1

export const CONDITION_OBJECT_ENTRY_GUID_CV1: Option[] = [
  { value: 3, name: 'TYPEID_UNIT' },
  { value: 4, name: 'TYPEID_PLAYER' },
  { value: 5, name: 'TYPEID_GAMEOBJECT' },
  { value: 7, name: 'TYPEID_CORPSE (player corpse, after spirit release)' },
];

export const CONDITION_STAND_STATE_CV1: Option[] = [
  { value: 0, name: 'Exact state used in ConditionValue2' },
  { value: 1, name: 'Any type of state in ConditionValue2' },
];

// ConditionValue2

export const CONDITION_LEVEL_CV2: Option[] = [
  { value: 0, name: 'Level must be equal' },
  { value: 1, name: 'Level must be higher' },
  { value: 2, name: 'Level must be lower' },
  { value: 3, name: 'Level must be equal or higher' },
  { value: 4, name: 'Level must be equal or lower' },
];

export const CONDITION_RELATION_TO_CV2: Option[] = [
  { value: 0, name: 'RELATION_SELF' },
  { value: 1, name: 'RELATION_IN_PARTY' },
  { value: 2, name: 'RELATION_IN_RAID_OR_PARTY' },
  { value: 3, name: 'RELATION_OWNED_BY (ConditionTarget is owned by ConditionValue1)' },
  { value: 4, name: 'RELATION_PASSENGER_OF (ConditionTarget is passenger of ConditionValue1)' },
  { value: 5, name: 'RELATION_CREATED_BY (ConditionTarget is summoned by ConditionValue1)' },
];

export const CONDITION_HP_VAL_CV2: Option[] = [
  { value: 0, name: 'HP must be equal' },
  { value: 1, name: 'HP must be higher' },
  { value: 2, name: 'HP must be lower' },
  { value: 3, name: 'HP must be equal or higher' },
  { value: 4, name: 'HP must be equal or lower' },
];

export const CONDITION_HP_PCT_CV2: Option[] = [
  { value: 0, name: 'Percentage of max HP must be equal' },
  { value: 1, name: 'Percentage of max HP must be higher' },
  { value: 2, name: 'Percentage of max HP must be lower' },
  { value: 3, name: 'Percentage of max HP must be equal or higher' },
  { value: 4, name: 'Percentage of max HP must be equal or lower' },
];

export const CONDITION_STAND_STATE_CV2: Option[] = [
  { value: 0, name: 'Standing' },
  { value: 1, name: 'Sitting' },
];

// ConditionValue3

export const CONDITION_DISTANCE_TO_CV3: Option[] = [
  { value: 0, name: 'Distance must be equal to ConditionValue2' },
  { value: 1, name: 'Distance must be higher than ConditionValue2' },
  { value: 2, name: 'Distance must be lower than ConditionValue2' },
  { value: 3, name: 'distance must be equal to or higher than ConditionValue2' },
  { value: 4, name: 'distance must be equal to or lower than ConditionValue2' },
];

export const CONDITION_NEAR_CREATURE_CV3: Option[] = [
  { value: 0, name: 'Alive' },
  { value: 1, name: 'Dead' },
];

export const CONDITION_INSTANCE_INFO_CV3: Option[] = [
  { value: 0, name: 'INSTANCE_INFO_DATA' },
  { value: 1, name: 'INSTANCE_INFO_GUID_DATA' },
  { value: 2, name: 'INSTANCE_INFO_BOSS_STATE' },
  { value: 3, name: 'INSTANCE_INFO_DATA64' },
];
