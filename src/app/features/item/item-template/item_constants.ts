export const ITEM_CONSTANTS = {
  'timeUnits': {
    sg: ['year',  'month',  'week',  'day',  'hour',  'minute',  'second',  'millisecond'],
    pl: ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds'],
    ab: ['yr',    'mo',     'wk',    'day',  'hr',    'min',     'sec',     'ms'],
  },
  'pvpRank': [                           // PVP_RANK_\d_\d(_FEMALE)?
    null,                           'Private / Scout',                    'Corporal / Grunt',
    'Sergeant / Sergeant',          'Master Sergeant / Senior Sergeant',  'Sergeant Major / First Sergeant',
    'Knight / Stone Guard',         'Knight-Lieutenant / Blood Guard',    'Knight-Captain / Legionnare',
    'Knight-Champion / Centurion',  'Lieutenant Commander / Champion',    'Commander / Lieutenant General',
    'Marshal / General',            'Field Marshal / Warlord',            'Grand Marshal / High Warlord'
  ],
  'gl':            [null, 'Major', 'Minor'],                                                                                                                                // MAJOR_GLYPH, MINOR_GLYPH
  'si':            { '-1': 'Alliance only', '-2': 'Horde only', 0: null, 1: 'Alliance', 2: 'Horde', 3: 'Both' },
  'resistances':   [null, 'Holy Resistance', 'Fire Resistance', 'Nature Resistance', 'Frost Resistance', 'Shadow Resistance', 'Arcane Resistance'],                         // RESISTANCE?_NAME
  'dt':            [null, 'Magic', 'Curse', 'Disease', 'Poison', 'Stealth', 'Invisibility', null, null, 'Enrage'],                                                          // SpellDispalType.dbc
  'sc':            ['Physical', 'Holy', 'Fire', 'Nature', 'Frost', 'Shadow', 'Arcane'],                                                                                     // STRING_SCHOOL_*
  'cl':            [null, 'Warrior', 'Paladin', 'Hunter', 'Rogue', 'Priest', 'Death Knight', 'Shaman', 'Mage', 'Warlock', null, 'Druid'],                                   // ChrClasses.dbc
  'ra': {  // ChrRaces.dbc
    '-2': 'Horde',
    '-1': 'Alliance',
    0:    null,
    1:    'Human',
    2:    'Orc',
    3:    'Dwarf',
    4:    'Night Elf',
    5:    'Undead',
    6:    'Tauren',
    7:    'Gnome',
    8:    'Troll',
    9:    null,
    10:   'Blood Elf',
    11:   'Draenei',
  },
  'rep':           ['Hated', 'Hostile', 'Unfriendly', 'Neutral', 'Friendly', 'Honored', 'Revered', 'Exalted'],                                                              // FACTION_STANDING_LABEL*
  'notFound':          'This item doesn\'t exist.',
  'armor':             '%s Armor',                      // ARMOR_TEMPLATE
  'block':             '%s Block',                      // SHIELD_BLOCK_TEMPLATE
  'charges':           '%d Charges', /* |4Charge: */    // ITEM_SPELL_CHARGES
  'locked':            'Locked',                        // LOCKED
  'ratingString':      '%s&nbsp;@&nbsp;L%s',
  'heroic':            'Heroic',                        // ITEM_HEROIC
  'startQuest':        'This Item Begins a Quest',      // ITEM_STARTS_QUEST
  'bagSlotString':     '%d Slot %s',                    // CONTAINER_SLOTS
  'fap':               'Feral Attack Power',
  'durability':        'Durability %d / %d',            // DURABILITY_TEMPLATE
  'realTime':          'real time',
  'conjured':          'Conjured Item',                 // ITEM_CONJURED
  'sellPrice':         'Sell Price',                    // SELL_PRICE
  'itemLevel':         'Item Level %d',                 // ITEM_LEVEL
  'randEnchant':       '&lt;Random enchantment&gt',     // ITEM_RANDOM_ENCHANT
  'readClick':         '&lt;Right Click To Read&gt',    // ITEM_READABLE
  'openClick':         '&lt;Right Click To Open&gt',    // ITEM_OPENABLE
  'setBonus':          '(%d) Set: %s',                  // ITEM_SET_BONUS_GRAY
  'setName':           '%s (%d/%d)',                    // ITEM_SET_NAME
  'partyLoot':         'Party loot',
  'smartLoot':         'Smart loot',
  'indestructible':    'Cannot be destroyed',
  'deprecated':        'Deprecated',
  'useInShape':        'Usable when shapeshifted',
  'useInArena':        'Usable in arenas',
  'refundable':        'Refundable',
  'noNeedRoll':        'Cannot roll Need',
  'atKeyring':         'Can be placed in the keyring',
  'worth':             'Worth',
  'consumable':        'Consumable',
  'nonConsumable':     'Non-consumable',
  'accountWide':       'Account-wide',
  'millable':          'Millable',                      // ITEM_MILLABLE
  'noEquipCD':         'No equip cooldown',
  'prospectable':      'Prospectable',                  // ITEM_PROSPECTABLE
  'disenchantable':    'Disenchantable',                // ITEM_DISENCHANT_ANY_SKILL
  'cantDisenchant':    'Cannot be disenchanted',        // ITEM_DISENCHANT_NOT_DISENCHANTABLE
  'repairCost':        'Repair cost',                   // REPAIR_COST
  'tool':              'Tool',
  'cost':              'Cost',                          // COSTS_LABEL
  'content':           'Content',
  // '_transfer'
  '_unavailable':      'This item is not available to players.',
  '_rndEnchants':      'Random Enchantments',
  '_chance':           '(%s%% chance)',
  'slot':              'Slot',
  '_quality':          'Quality',                       // QUALITY
  'usableBy':          'Usable by',
  'buyout':            'Buyout price',                  // BUYOUT_PRICE
  'each':              'each',
  'tabOther':          'Other',
  'reqMinLevel':       'Requires Level %d',             // ITEM_MIN_LEVEL
  'reqLevelRange':     'Requires level %d to %d (%s)',  // ITEM_LEVEL_RANGE_CURRENT
  'unique':            ['Unique',          'Unique (%d)', 'Unique: %s (%d)'         ],   // ITEM_UNIQUE, ITEM_UNIQUE_MULTIPLE, ITEM_LIMIT_CATEGORY
  'uniqueEquipped':    ['Unique-Equipped', null,          'Unique-Equipped: %s (%d)'],   // ITEM_UNIQUE_EQUIPPABLE, null, ITEM_LIMIT_CATEGORY_MULTIPLE
  'speed':             'Speed',                         // SPEED
  'dps':               '(%.1f damage per second)',      // DPS_TEMPLATE
  'damage': {                                   // *DAMAGE_TEMPLATE*
            //  basic,                          basic /w school,                add basic,                  add basic /w school
    'single': ['%d Damage',                    '%d %s Damage',                 '+ %d Damage',              '+%d %s Damage'             ],
    'range':  ['%d - %d Damage',               '%d - %d %s Damage',            '+ %d - %d Damage',         '+%d - %d %s Damage'        ],
    'ammo':   ['Adds %g damage per second',    'Adds %g %s damage per second', '+ %g damage per second',   '+ %g %s damage per second' ],
  },
  'gems':        'Gems',
  'socketBonus': 'Socket Bonus: %s',              // ITEM_SOCKET_BONUS
  'socket': [
      'Meta Socket',
      'Red Socket',
      'Yellow Socket',
      'Blue Socket',
      // -1 => 'Prismatic Socket' // TODO
  ],
  'gemColors': [                                  // *_GEM
    'meta',
    'red',
    'yellow',
    'blue'
  ],
  'gemConditions': {                              // ENCHANT_CONDITION_* in GlobalStrings.lua
    2: 'less than %d %s |4gem:gems;',
    3: 'more %s gems than %s gems',
    5: 'at least %d %s |4gem:gems',
  },
  'reqRating': [                                    // ITEM_REQ_ARENA_RATING*
      'Requires personal and team arena rating of %d',
      'Requires personal and team arena rating of %d|nin 3v3 or 5v5 brackets',
      'Requires personal and team arena rating of %d|nin 5v5 bracket',
  ],
  'quality': [                                       // ITEM_QUALITY?_DESC
    'Poor',
    'Common',
    'Uncommon',
    'Rare',
    'Epic',
    'Legendary',
    'Artifact',
    'Heirloom',
  ],
  'trigger': [                                        // ITEM_SPELL_TRIGGER_*
    'Use: ',
    'Equip: ',
    'Chance on hit: ',
    '',
    '',
    '',
    '',
  ],
  'bonding': [                                        // ITEM_BIND_*
      'Binds to account',
      'Binds when picked up',
      'Binds when equipped',
      'Binds when used',
      'Quest Item',
      'Quest Item'
  ],
  'bagFamily': [                                       // ItemSubClass.dbc/1
      'Bag',
      'Quiver',
      'Ammo Pouch',
      'Soul Bag',
      'Leatherworking Bag',
      'Inscription Bag',
      'Herb Bag',
      'Enchanting Bag',
      'Engineering Bag',
      null, /*Key*/
      'Gem Bag',
      'Mining Bag',
  ],
  'inventoryType': [                                   // INVTYPE_*
      null,                   'Head',             'Neck',                 'Shoulder',                     'Shirt',
      'Chest',                'Waist',            'Legs',                 'Feet',                         'Wrist',
      'Hands',                'Finger',           'Trinket',              'One-Hand',                     'Off Hand', /*Shield*/
      'Ranged',               'Back',             'Two-Hand',             'Bag',                          'Tabard',
      null, /*Robe*/          'Main Hand',        'Off Hand',             'Held In Off-Hand',             'Projectile',
      'Thrown',               null, /*Ranged2*/   'Quiver',               'Relic'
  ],
  'armorSubClass': [                           // ItemSubClass.dbc/2
      'Miscellaneous',        'Cloth',            'Leather',              'Mail',                         'Plate',
      null,                   'Shield',           'Libram',               'Idol',                         'Totem',
      'Sigil'
  ],
  'weaponSubClass': [                           // ItemSubClass.dbc/4
      'Axe',                  'Axe',              'Bow',                  'Gun',                          'Mace',
      'Mace',                 'Polearm',          'Sword',                'Sword',                        null,
      'Staff',                null,               null,                   'Fist Weapon',                  'Miscellaneous',
      'Dagger',               'Thrown',           null,                   'Crossbow',                     'Wand',
      'Fishing Pole',
  ],
  'projectileSubClass': [                      // ItemSubClass.dbc/6
      null,                   null,               'Arrow',                'Bullet',                        null
  ],
  'elixirType': [null, 'Battle', 'Guardian'],
  'statType': [                           // ITEM_MOD_*
    'Mana',
    'Health',
    null,
    'Agility',
    'Strength',
    'Intellect',
    'Spirit',
    'Stamina',
    null, null, null, null,
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
    'Increases damage done by magical spells and effects by up to %d.',
    'Increases healing done by magical spells and effects by up to %d.',
    'Restores %d mana per 5 sec.',
    'Increases your armor penetration rating by %d.',
    'Increases spell power by %d.',
    'Restores %d health per 5 sec.',
    'Increases spell penetration by %d.',
    'Increases the block value of your shield by %d.',
    'Unknown Bonus #%d (%d)',
  ]
};
