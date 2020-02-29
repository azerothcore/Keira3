export const AOWOW_ITEM = {
  'notFound':          'This item doesn\'t exist.',
  'armor':             '%s Armor',                      // ARMOR_TEMPLATE
  'block':             '%s Block',                      // SHIELD_BLOCK_TEMPLATE
  'charges':           '%d |4Charge:Charges;',          // ITEM_SPELL_CHARGES
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
  // '_transfer':          'This item will be converted to <a href="?item=%d" class="q%d icontiny tinyspecial" ' + 'style="background-image: url('.STATIC_URL.'/images/wow/icons/tiny/%s.gif)">%s</a> if you transfer to <span class="icon-%s">%s</span>.',
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
  // 'cat': {                           // ordered by content first, then alphabeticaly; item menu from locale_enus.js
  //      2: 'Weapons',                                // self::$spell['weaponSubClass']
  //      4: [ // TODO
  //        'Armor', {
  //          1: 'Cloth Armor',                 2: 'Leather Armor',           3: 'Mail Armor',              4: 'Plate Armor',             6: 'Shields',                 7: 'Librams',
  //          8: 'Idols',                       9: 'Totems',                 10: 'Sigils',                 -6: 'Cloaks',                 -5: 'Off-hand Frills',        -8: 'Shirts',
  //         -7: 'Tabards',                    -3: 'Amulets',                -2: 'Rings',                  -4: 'Trinkets',                0: 'Miscellaneous (Armor)',
  //     }],
  //      1 => array("Containers", array(
  //          0 => "Bags",                        3 => "Enchanting Bags",         4 => "Engineering Bags",        5 => "Gem Bags",                2 => "Herb Bags",               8 => "Inscription Bags",
  //          7 => "Leatherworking Bags",         6 => "Mining Bags",             1 => "Soul Bags"
  //     )),
  //      0 => array("Consumables", array(
  //         -3 => "Item Enhancements (Temporary)",                               6 => "Item Enhancements (Permanent)",                           2 => ["Elixirs", [1 => "Battle Elixirs", 2 => "Guardian Elixirs"]],
  //          1 => "Potions",                     4 => "Scrolls",                 7 => "Bandages",                0 => "Consumables",             3 => "Flasks",                  5 => "Food & Drinks",
  //          8 => "Other (Consumables)"
  //     )),
  //     16 => array("Glyphs", array(
  //          1 => "Warrior Glyphs",              2 => "Paladin Glyphs",          3 => "Hunter Glyphs",           4 => "Rogue Glyphs",            5 => "Priest Glyphs",           6 => "Death Knight Glyphs",
  //          7 => "Shaman Glyphs",               8 => "Mage Glyphs",             9 => "Warlock Glyphs",         11 => "Druid Glyphs"
  //     )),
  //      7 => array("Trade Goods", array(
  //         14 => "Armor Enchantments",          5 => "Cloth",                   3 => "Devices",                10 => "Elemental",              12 => "Enchanting",              2 => "Explosives",
  //          9 => "Herbs",                       4 => "Jewelcrafting",           6 => "Leather",                13 => "Materials",               8 => "Meat",                    7 => "Metal & Stone",
  //          1 => "Parts",                      15 => "Weapon Enchantments",    11 => "Other (Trade Goods)"
  //      )),
  //      6 => ["Projectiles", [                  2 => "Arrows",                  3 => "Bullets"     ]],
  //     11 => ["Quivers",     [                  2 => "Quivers",                 3 => "Ammo Pouches"]],
  //      9 => array("Recipes", array(
  //          0 => "Books",                       6 => "Alchemy Recipes",         4 => "Blacksmithing Plans",     5 => "Cooking Recipes",         8 => "Enchanting Formulae",     3 => "Engineering Schematics",
  //          7 => "First Aid Books",             9 => "Fishing Books",          11 => "Inscription Techniques", 10 => "Jewelcrafting Designs",   1 => "Leatherworking Patterns",12 => "Mining Guides",
  //          2 => "Tailoring Patterns"
  //     )),
  //      3 => array("Gems", array(
  //          6 => "Meta Gems",                   0 => "Red Gems",                1 => "Blue Gems",               2 => "Yellow Gems",             3 => "Purple Gems",             4 => "Green Gems",
  //          5 => "Orange Gems",                 8 => "Prismatic Gems",          7 => "Simple Gems"
  //     )),
  //     15 => array("Miscellaneous", array(
  //         -2 => "Armor Tokens",                3 => "Holiday",                 0 => "Junk",                    1 => "Reagents",                5 => "Mounts",                 -7 => "Flying Mounts",
  //          2 => "Small Pets",                  4 => "Other (Miscellaneous)"
  //     )),
  //     10 => "Currency",
  //     12 => "Quest",
  //     13 => "Keys",
  // },
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
