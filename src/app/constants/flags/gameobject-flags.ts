import { Flag } from '../../types/general';

export const GAMEOBJECT_FLAGS: Flag[] = [
  { bit: 0,   name: 'IN_USE'         },
  { bit: 2,   name: 'LOCKED'         },
  { bit: 4,   name: 'INTERACT_COND'  },
  { bit: 8,   name: 'TRANSPORT'      },
  { bit: 10,  name: 'NOT_SELECTABLE' },
  { bit: 20,  name: 'NODESPAWN'      },
  { bit: 40,  name: 'TRIGGERED'      },
  { bit: 200, name: 'DAMAGED'        },
  { bit: 400, name: 'DESTROYED'      },
];
