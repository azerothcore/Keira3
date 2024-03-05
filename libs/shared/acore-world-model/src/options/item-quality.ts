import { Option } from '@keira/shared/constants';

export const ITEM_QUALITY: Option[] = [
  { value: 0, name: 'Grey (Poor)' },
  { value: 1, name: 'White (Common)' },
  { value: 2, name: 'Green (Uncommon)' },
  { value: 3, name: 'Blue (Rare)' },
  { value: 4, name: 'Purple (Epic)' },
  { value: 5, name: 'Orange (Legendary)' },
  { value: 6, name: 'Red (Artifact)' },
  { value: 7, name: 'Gold (Bind to Account) [requires flags 134221824]' },
];

export const enum ITEMS_QUALITY {
  POOR = 0, // GREY
  NORMAL = 1, // WHITE
  UNCOMMON = 2, // GREEN
  RARE = 3, // BLUE
  EPIC = 4, // PURPLE
  LEGENDARY = 5, // ORANGE
  ARTIFACT = 6, // LIGHT YELLOW
  HEIRLOOM = 7, // GOLD
}
