import { Flag } from '@keira/shared-constants';
import { INVENTORY_TYPE } from '../options/inventory-type';
import { ITEM_SUBCLASS } from '../options/item-class';

export const SPELL_DBC_INVENTORY_TYPE: Flag[] = INVENTORY_TYPE.slice(1, INVENTORY_TYPE.length).map((option) => ({
  bit: (option.value as number) - 1,
  name: option.name,
}));

export const SPELL_DBC_ITEM_SUBCLASS: Flag[][] = ITEM_SUBCLASS.map((subclass) =>
  subclass.map((option) => ({
    bit: option.value as number,
    name: option.name,
  })),
);
