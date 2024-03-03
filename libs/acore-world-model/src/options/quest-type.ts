import { Option } from '@keira/shared-constants';

export const QUEST_TYPE: Option[] = [
  {
    value: 0,
    name: 'The quest is enabled, but it is auto-completed when accepted; this skips quest objectives and quest details',
  },
  { value: 1, name: 'The quest is disabled' },
  { value: 2, name: 'The quest is enabled (does not auto-complete)' },
  { value: 3, name: 'The quest is a World Quest' },
];
