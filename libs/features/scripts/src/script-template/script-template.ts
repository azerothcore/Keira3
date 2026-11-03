/**
 * Starting files for an AzerothCore script, in the core's own way (master): the header with its constants (spells,
 * events, texts, the instance's data) and the .cpp with the script and its `AddSC_` registration, plus what to add to
 * the script loader and the SQL naming the script in the database. A start to fill in, not a finished script.
 */

export type ScriptTemplateKind = 'creature' | 'boss' | 'gameobject' | 'spell' | 'aura' | 'instance';

export const SCRIPT_TEMPLATE_KINDS: ScriptTemplateKind[] = ['creature', 'boss', 'gameobject', 'spell', 'aura', 'instance'];

/** A constant of an enum: its name and, when given, its value (`SPELL_FIREBALL = 133`). */
export interface ScriptConstant {
  name: string;
  value?: number;
}

export interface ScriptTemplateOptions {
  kind: ScriptTemplateKind;
  /** The script's name, its `ScriptName` (`boss_hogger`, `spell_gen_x`). */
  name: string;
  /** The entry it's for (creature or gameobject entry, spell id, map id of an instance). */
  entry?: number;
  /** The instance (its short name, `Naxxramas`) a boss belongs to, and its bosses for an instance. */
  instance?: string;
  spells: ScriptConstant[];
  events: string[];
  texts: string[];
  /** An instance's bosses (BOSS_ constants), in order. */
  bosses: string[];
}

/** A file made: its name and what it holds. */
export interface ScriptFile {
  name: string;
  text: string;
}

/** A C++ name from what's typed: letters, digits and `_`, not starting with a digit. */
export const cppName = (text: string): string =>
  text
    .trim()
    .replace(/[^A-Za-z0-9_]+/g, '_')
    .replace(/^(\d)/, '_$1');

/** A constant's name: upper case, with its prefix (`fireball` → `SPELL_FIREBALL`). */
export const constantName = (text: string, prefix: string): string => {
  const name = cppName(text).toUpperCase();
  return name.startsWith(`${prefix}_`) ? name : `${prefix}_${name}`;
};

/** "Fireball = 133" or "fireball 133" lines, one constant each. */
export function parseConstants(text: string): ScriptConstant[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = /^(.*?)[\s=]+(\d+)$/.exec(line);
      return match ? { name: match[1], value: Number(match[2]) } : { name: line };
    });
}

/** Names, one per line. */
export const parseNames = (text: string): string[] =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

function enumBlock(name: string, constants: { name: string; value: number | string }[]): string {
  if (!constants.length) {
    return '';
  }
  const width = Math.max(...constants.map((constant) => constant.name.length)) + 1;
  return [`enum ${name}`, '{', ...constants.map(({ name, value }) => `    ${name.padEnd(width)}= ${value},`), '};', ''].join('\n');
}

const spellEnum = (options: ScriptTemplateOptions): string =>
  enumBlock(
    'Spells',
    options.spells.map((spell) => ({ name: constantName(spell.name, 'SPELL'), value: spell.value ?? 0 })),
  );
const eventEnum = (options: ScriptTemplateOptions): string =>
  enumBlock(
    'Events',
    options.events.map((event, i) => ({ name: constantName(event, 'EVENT'), value: i + 1 })),
  );
const textEnum = (options: ScriptTemplateOptions): string =>
  enumBlock(
    'Texts',
    options.texts.map((text, i) => ({ name: constantName(text, 'SAY'), value: i })),
  );

/** The instance's short name in C++ (`Naxxramas`), and its header's file name. */
const instanceOf = (options: ScriptTemplateOptions): string => cppName(options.instance || 'MyInstance');
const headerName = (instance: string): string => `${instance.toLowerCase()}.h`;

const includes = (names: string[]): string => names.map((name) => `#include "${name}"`).join('\n');

/** The events' cases of an UpdateAI (each repeated after a while: to change). */
const eventCases = (options: ScriptTemplateOptions, indent: string): string =>
  options.events
    .map((event) =>
      [
        `${indent}case ${constantName(event, 'EVENT')}:`,
        `${indent}    // TODO`,
        `${indent}    events.Repeat(10s);`,
        `${indent}    break;`,
      ].join('\n'),
    )
    .join('\n');

const scheduled = (options: ScriptTemplateOptions, indent: string): string =>
  options.events.map((event) => `${indent}events.ScheduleEvent(${constantName(event, 'EVENT')}, 10s);`).join('\n');

function creatureCpp(options: ScriptTemplateOptions, name: string): string {
  const boss = options.kind === 'boss';
  const instance = instanceOf(options);
  const base = boss ? 'BossAI' : 'ScriptedAI';
  const head = boss
    ? `    ${name}(Creature* creature) : BossAI(creature, ${constantName(name.replace(/^boss_/, ''), 'DATA')}) { }`
    : `    ${name}(Creature* creature) : ScriptedAI(creature) { }`;
  const engage = boss
    ? [
        '    void JustEngagedWith(Unit* who) override',
        '    {',
        '        BossAI::JustEngagedWith(who);',
        scheduled(options, '        '),
        '    }',
      ]
    : [
        '    void Reset() override',
        '    {',
        '        events.Reset();',
        '    }',
        '',
        '    void JustEngagedWith(Unit* /*who*/) override',
        '    {',
        scheduled(options, '        '),
        '    }',
      ];
  return [
    includes(['CreatureScript.h', 'ScriptedCreature.h', ...(boss ? [headerName(instance)] : [])]),
    '',
    spellEnum(options) + eventEnum(options) + textEnum(options),
    `struct ${name} : public ${base}`,
    '{',
    head,
    '',
    ...engage.filter((line) => line !== ''),
    '',
    '    void UpdateAI(uint32 diff) override',
    '    {',
    '        if (!UpdateVictim())',
    '            return;',
    '',
    '        events.Update(diff);',
    '        if (me->HasUnitState(UNIT_STATE_CASTING))',
    '            return;',
    '',
    '        while (uint32 eventId = events.ExecuteEvent())',
    '        {',
    '            switch (eventId)',
    '            {',
    eventCases(options, '                '),
    '                default:',
    '                    break;',
    '            }',
    '        }',
    '',
    '        DoMeleeAttackIfReady();',
    '    }',
    ...(boss ? [] : ['', 'private:', '    EventMap events;']),
    '};',
    '',
    `void AddSC_${name}()`,
    '{',
    boss ? `    RegisterCreatureAIWithFactory(${name}, Get${instance}AI);` : `    RegisterCreatureAI(${name});`,
    '}',
    '',
  ]
    .filter((line, i, all) => !(line === '' && all[i - 1] === ''))
    .join('\n');
}

function gameObjectCpp(name: string): string {
  return [
    includes(['GameObjectScript.h', 'GameObjectAI.h', 'Player.h']),
    '',
    `struct ${name} : public GameObjectAI`,
    '{',
    `    ${name}(GameObject* go) : GameObjectAI(go) { }`,
    '',
    '    bool GossipHello(Player* /*player*/, bool /*reportUse*/) override',
    '    {',
    '        // TODO',
    '        return false;',
    '    }',
    '};',
    '',
    `void AddSC_${name}()`,
    '{',
    `    RegisterGameObjectAI(${name});`,
    '}',
    '',
  ].join('\n');
}

function spellCpp(options: ScriptTemplateOptions, name: string): string {
  const aura = options.kind === 'aura';
  const base = aura ? 'AuraScript' : 'SpellScript';
  const spells = options.spells.map((spell) => constantName(spell.name, 'SPELL'));
  const handler = aura
    ? ['    void HandlePeriodic(AuraEffect const* /*aurEff*/)', '    {', '        // TODO', '    }']
    : ['    void HandleDummy(SpellEffIndex /*effIndex*/)', '    {', '        // TODO', '    }'];
  const hook = aura
    ? `        OnEffectPeriodic += AuraEffectPeriodicFn(${name}::HandlePeriodic, EFFECT_0, SPELL_AURA_PERIODIC_DUMMY);`
    : `        OnEffectHitTarget += SpellEffectFn(${name}::HandleDummy, EFFECT_0, SPELL_EFFECT_DUMMY);`;
  return [
    includes(['SpellScript.h', 'SpellScriptLoader.h', ...(aura ? ['SpellAuraEffects.h'] : [])]),
    '',
    spellEnum(options),
    `class ${name} : public ${base}`,
    '{',
    `    ${aura ? 'PrepareAuraScript' : 'PrepareSpellScript'}(${name});`,
    '',
    ...(spells.length
      ? [
          '    bool Validate(SpellInfo const* /*spellInfo*/) override',
          '    {',
          `        return ValidateSpellInfo({ ${spells.join(', ')} });`,
          '    }',
          '',
        ]
      : []),
    ...handler,
    '',
    '    void Register() override',
    '    {',
    hook,
    '    }',
    '};',
    '',
    `void AddSC_${name}()`,
    '{',
    `    RegisterSpellScript(${name});`,
    '}',
    '',
  ]
    .filter((line, i, all) => !(line === '' && all[i - 1] === ''))
    .join('\n');
}

function instanceHeader(options: ScriptTemplateOptions): string {
  const instance = instanceOf(options);
  const guard = `DEF_${instance.toUpperCase()}_H`;
  const bosses = options.bosses.map((boss, i) => ({ name: constantName(boss, 'DATA'), value: i }));
  return [
    `#ifndef ${guard}`,
    `#define ${guard}`,
    '',
    includes(['CreatureAIImpl.h']),
    '',
    `#define DataHeader "${instance.slice(0, 3).toUpperCase()}"`,
    `#define ${instance}ScriptName "${cppName(options.name)}"`,
    '',
    enumBlock(`${instance}Data`, [...bosses, { name: 'MAX_ENCOUNTERS', value: bosses.length }]) + '',
    'template <class AI, class T>',
    `inline AI* Get${instance}AI(T* obj)`,
    '{',
    `    return GetInstanceAI<AI>(obj, ${instance}ScriptName);`,
    '}',
    '',
    '#endif',
    '',
  ].join('\n');
}

function instanceCpp(options: ScriptTemplateOptions, name: string): string {
  return [
    includes(['InstanceMapScript.h', 'InstanceScript.h', headerName(instanceOf(options))]),
    '',
    `class ${name} : public InstanceScript`,
    '{',
    'public:',
    `    ${name}(Map* map) : InstanceScript(map)`,
    '    {',
    '        SetHeaders(DataHeader);',
    '        SetBossNumber(MAX_ENCOUNTERS);',
    '    }',
    '};',
    '',
    `void AddSC_${name}()`,
    '{',
    `    RegisterInstanceScript(${name}, ${options.entry ?? 0});`,
    '}',
    '',
  ].join('\n');
}

/** The table and column naming the script, by kind (for the SQL). */
const SCRIPT_NAME_COLUMN: Record<ScriptTemplateKind, { table: string; key: string; column: string } | undefined> = {
  creature: { table: 'creature_template', key: 'entry', column: 'ScriptName' },
  boss: { table: 'creature_template', key: 'entry', column: 'ScriptName' },
  gameobject: { table: 'gameobject_template', key: 'entry', column: 'ScriptName' },
  spell: undefined,
  aura: undefined,
  instance: { table: 'instance_template', key: 'map', column: 'script' },
};

/** The SQL naming the script in the database. */
export function scriptSql(options: ScriptTemplateOptions): string {
  const name = cppName(options.name);
  const entry = options.entry ?? 0;
  if (options.kind === 'spell' || options.kind === 'aura') {
    return [
      `DELETE FROM \`spell_script_names\` WHERE \`spell_id\` = ${entry} AND \`ScriptName\` = '${name}';`,
      `INSERT INTO \`spell_script_names\` (\`spell_id\`, \`ScriptName\`) VALUES (${entry}, '${name}');`,
    ].join('\n');
  }
  const { table, key, column } = SCRIPT_NAME_COLUMN[options.kind] as { table: string; key: string; column: string };
  return `UPDATE \`${table}\` SET \`${column}\` = '${name}' WHERE \`${key}\` = ${entry};`;
}

/** The files of a script, and the line to add to the script loader. */
export function scriptTemplate(options: ScriptTemplateOptions): { files: ScriptFile[]; loader: string; sql: string } {
  const name = cppName(options.name) || 'my_script';
  const files: ScriptFile[] = [];
  switch (options.kind) {
    case 'creature':
    case 'boss':
      files.push({ name: `${name}.cpp`, text: creatureCpp(options, name) });
      break;
    case 'gameobject':
      files.push({ name: `${name}.cpp`, text: gameObjectCpp(name) });
      break;
    case 'spell':
    case 'aura':
      files.push({ name: `${name}.cpp`, text: spellCpp(options, name) });
      break;
    case 'instance':
      files.push({ name: headerName(instanceOf(options)), text: instanceHeader(options) });
      files.push({ name: `${name}.cpp`, text: instanceCpp(options, name) });
      break;
  }
  return { files, loader: `void AddSC_${name}();\n    AddSC_${name}();`, sql: scriptSql({ ...options, name }) };
}
