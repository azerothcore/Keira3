export const ITEM_CONSTANTS = {
  timeUnits: {
    sg: ['year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'],
    pl: ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds'],
    ab: ['yr', 'mo', 'wk', 'day', 'hr', 'min', 'sec', 'ms'],
  },
  resistances: [
    /* null, */ 'Holy Resistance',
    'Fire Resistance',
    'Nature Resistance',
    'Frost Resistance',
    'Shadow Resistance',
    'Arcane Resistance',
  ], // RESISTANCE?_NAME
  sc: ['Physical', 'Holy', 'Fire', 'Nature', 'Frost', 'Shadow', 'Arcane'], // STRING_SCHOOL_*
  armor: '%s Armor', // ARMOR_TEMPLATE
  block: '%s Block', // SHIELD_BLOCK_TEMPLATE
  charges: '%d Charges' /* |4Charge: */, // ITEM_SPELL_CHARGES
  locked: 'Locked', // LOCKED
  ratingString: '%s&nbsp;@&nbsp;L%s',
  fap: 'Feral Attack Power',
  durability: 'Durability %d / %d', // DURABILITY_TEMPLATE
  itemLevel: 'Item Level %d', // ITEM_LEVEL
  randEnchant: '&lt;Random enchantment&gt', // ITEM_RANDOM_ENCHANT
  readClick: '&lt;Right Click To Read&gt', // ITEM_READABLE
  openClick: '&lt;Right Click To Open&gt', // ITEM_OPENABLE
  setBonus: '(%d) Set: %s', // ITEM_SET_BONUS_GRAY
  setName: '%s (%d/%d)', // ITEM_SET_NAME
  reqMinLevel: 'Requires Level %d', // ITEM_MIN_LEVEL
  reqLevelRange: 'Requires level %d to %d (%s)', // ITEM_LEVEL_RANGE_CURRENT
  unique: ['Unique', 'Unique (%d)', 'Unique: %s (%d)'], // ITEM_UNIQUE, ITEM_UNIQUE_MULTIPLE, ITEM_LIMIT_CATEGORY
  uniqueEquipped: ['Unique-Equipped', null, 'Unique-Equipped: %s (%d)'], // ITEM_UNIQUE_EQUIPPABLE, null, ITEM_LIMIT_CATEGORY_MULTIPLE
  dps: '(%.1f damage per second)', // DPS_TEMPLATE
  damage: {
    // *DAMAGE_TEMPLATE*
    //  basic,                          basic /w school,                add basic,                  add basic /w school
    single: ['%d Damage', '%d %s Damage', '+ %d Damage', '+%d %s Damage'],
    range: ['%d - %d Damage', '%d - %d %s Damage', '+ %d - %d Damage', '+%d - %d %s Damage'],
    ammo: ['Adds %d damage per second', 'Adds %d %s damage per second', '+ %d damage per second', '+ %d %s damage per second'],
  },
  socketBonus: 'Socket Bonus: %s', // ITEM_SOCKET_BONUS
  socket: [
    'Meta Socket',
    'Red Socket',
    'Yellow Socket',
    'Blue Socket',
    // -1 => 'Prismatic Socket' // TODO
  ],
  gemColors: [
    // *_GEM
    'meta',
    'red',
    'yellow',
    'blue',
  ],
  gemConditions: {
    // ENCHANT_CONDITION_* in GlobalStrings.lua
    2: 'less than %s %s gems;',
    3: 'more %s gems than %s gems',
    5: 'at least %s %s gems',
  },
  reqRating: [
    // ITEM_REQ_ARENA_RATING*
    'Requires personal and team arena rating of %d',
    'Requires personal and team arena rating of %d in 3v3 or 5v5 brackets',
    'Requires personal and team arena rating of %d in 5v5 bracket',
  ],
  quality: [
    // ITEM_QUALITY?_DESC
    'Poor',
    'Common',
    'Uncommon',
    'Rare',
    'Epic',
    'Legendary',
    'Artifact',
    'Heirloom',
  ],
  trigger: [
    // ITEM_SPELL_TRIGGER_*
    'Use: ',
    'Equip: ',
    'Chance on hit: ',
    '',
    '',
    '',
    '',
  ],
  bonding: [
    // ITEM_BIND_*
    'Binds to account',
    'Binds when picked up',
    'Binds when equipped',
    'Binds when used',
    'Quest Item',
    'Quest Item',
  ],
  bagFamily: [
    // ItemSubClass.dbc/1
    'Bag',
    'Quiver',
    'Ammo Pouch',
    'Soul Bag',
    'Leatherworking Bag',
    'Inscription Bag',
    'Herb Bag',
    'Enchanting Bag',
    'Engineering Bag',
    null /* Key */,
    'Gem Bag',
    'Mining Bag',
  ],
  inventoryType: [
    // INVTYPE_*
    null,
    'Head',
    'Neck',
    'Shoulder',
    'Shirt',
    'Chest',
    'Waist',
    'Legs',
    'Feet',
    'Wrist',
    'Hands',
    'Finger',
    'Trinket',
    'One-Hand',
    'Off Hand' /*Shield*/,
    'Ranged',
    'Back',
    'Two-Hand',
    'Bag',
    'Tabard',
    'Robe',
    'Main Hand',
    'Off Hand',
    'Held In Off-Hand',
    'Projectile',
    'Thrown',
    'Ranged',
    'Quiver',
    'Relic',
  ],
  armorSubClass: [
    // ItemSubClass.dbc/2
    'Miscellaneous',
    'Cloth',
    'Leather',
    'Mail',
    'Plate',
    null,
    'Shield',
    'Libram',
    'Idol',
    'Totem',
    'Sigil',
  ],
  weaponSubClass: [
    // ItemSubClass.dbc/4
    'Axe',
    'Axe',
    'Bow',
    'Gun',
    'Mace',
    'Mace',
    'Polearm',
    'Sword',
    'Sword',
    null,
    'Staff',
    null,
    null,
    'Fist Weapon',
    'Miscellaneous',
    'Dagger',
    'Thrown',
    null,
    'Crossbow',
    'Wand',
    'Fishing Pole',
  ],
  projectileSubClass: [
    // ItemSubClass.dbc/6
    null,
    null,
    'Arrow',
    'Bullet',
    null,
  ],
  statType: [
    // ITEM_MOD_*
    'Mana',
    'Health',
    null,
    'Agility',
    'Strength',
    'Intellect',
    'Spirit',
    'Stamina',
    null,
    null,
    null,
    null,
    'Increases defense rating by %d.',
    'Increases your dodge rating by %d.',
    'Increases your parry rating by %d.',
    'Increases your shield block rating by %d.',
    'Improves melee hit rating by %d.',
    'Improves ranged hit rating by %d.',
    'Improves spell hit rating by %d.',
    'Improves melee critical strike rating by %d.',
    'Improves ranged critical strike rating by %d.',
    'Improves spell critical strike rating by %d.',
    'Improves melee hit avoidance rating by %d.',
    'Improves ranged hit avoidance rating by %d.',
    'Improves spell hit avoidance rating by %d.',
    'Improves melee critical avoidance rating by %d.',
    'Improves ranged critical avoidance rating by %d.',
    'Improves spell critical avoidance rating by %d.',
    'Improves melee haste rating by %d.',
    'Improves ranged haste rating by %d.',
    'Improves spell haste rating by %d.',
    'Improves hit rating by %d.',
    'Improves critical strike rating by %d.',
    'Improves hit avoidance rating by %d.',
    'Improves critical avoidance rating by %d.',
    'Increases your resilience rating by %d.',
    'Increases your haste rating by %d.',
    'Increases expertise rating by %d.',
    'Increases attack power by %d.',
    'Increases ranged attack power by %d.',
    'Increases attack power by %d in Cat, Bear, Dire Bear, and Moonkin forms only.',
    'Increases healing done by magical spells and effects by up to %d.',
    'Increases damage done by magical spells and effects by up to %d.',
    'Restores %d mana per 5 sec.',
    'Increases your armor penetration rating by %d.',
    'Increases spell power by %d.',
    'Restores %d health per 5 sec.',
    'Increases spell penetration by %d.',
    'Increases the block value of your shield by %d.',
    'Unknown Bonus #%d (%d)',
  ],
  lockType: [
    // lockType.dbc
    null,
    'Lockpicking',
    'Herbalism',
    'Mining',
    'Disarm Trap',
    'Open',
    'Treasure (DND)',
    'Calcified Elven Gems (DND)',
    'Close',
    'Arm Trap',
    'Quick Open',
    'Quick Close',
    'Open Tinkering',
    'Open Kneeling',
    'Open Attacking',
    "Gahz'ridian (DND)",
    'Blasting',
    'PvP Open',
    'PvP Close',
    'Fishing (DND)',
    'Inscription',
    'Open From Vehicle',
  ],
};

export const SPELL_TRIGGERS = ['Use', 'On Equip', 'Chance on Hit', 'Unknown', 'Soulstone', 'Use with no delay', 'Learn Spell ID'] as const;
