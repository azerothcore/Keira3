import { Flag } from '../../types/general';

export const GAMEOBJECT_FLAGS: Flag[] = [
  { bit: 0,   name: 'IN_USE'         },
  { bit: 1,   name: 'LOCKED'         },
  { bit: 2,   name: 'INTERACT_COND'  },
  { bit: 3,   name: 'TRANSPORT'      },
  { bit: 4,   name: 'NOT_SELECTABLE' },
  { bit: 5,   name: 'NODESPAWN'      },
  { bit: 6,   name: 'TRIGGERED'      },
  { bit: 7,   name: 'DAMAGED'        },
  { bit: 8,   name: 'DESTROYED'      },
];
