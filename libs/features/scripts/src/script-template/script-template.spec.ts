import { constantName, cppName, parseConstants, parseNames, scriptTemplate, ScriptTemplateOptions } from './script-template';

describe('scriptTemplate', () => {
  const options = (changes: Partial<ScriptTemplateOptions>): ScriptTemplateOptions => ({
    kind: 'creature',
    name: 'npc_guard',
    entry: 68,
    instance: '',
    spells: [],
    events: [],
    texts: [],
    bosses: [],
    ...changes,
  });

  it('reads constants and names, and makes C++ names of them', () => {
    expect(parseConstants('Fireball = 133\n\nfrost nova 122\nShadow Bolt')).toEqual([
      { name: 'Fireball', value: 133 },
      { name: 'frost nova', value: 122 },
      { name: 'Shadow Bolt' },
    ]);
    expect(parseNames(' a \n\nb')).toEqual(['a', 'b']);
    expect(cppName(' 2 bad-name ')).toBe('_2_bad_name');
    expect(constantName('frost nova', 'SPELL')).toBe('SPELL_FROST_NOVA');
    expect(constantName('SPELL_X', 'SPELL')).toBe('SPELL_X');
  });

  it('makes a creature script: its constants, its events, its registration and the SQL naming it', () => {
    const { files, loader, sql } = scriptTemplate(
      options({ spells: [{ name: 'Fireball', value: 133 }, { name: 'Unknown' }], events: ['Fireball'], texts: ['Aggro'] }),
    );
    expect(files.map((file) => file.name)).toEqual(['npc_guard.cpp']);
    const cpp = files[0].text;
    expect(cpp).toContain('#include "ScriptedCreature.h"');
    expect(cpp).toContain('    SPELL_FIREBALL = 133,');
    expect(cpp).toContain('    SPELL_UNKNOWN  = 0,');
    expect(cpp).toContain('    EVENT_FIREBALL = 1,');
    expect(cpp).toContain('    SAY_AGGRO = 0,');
    expect(cpp).toContain('struct npc_guard : public ScriptedAI');
    expect(cpp).toContain('events.ScheduleEvent(EVENT_FIREBALL, 10s);');
    expect(cpp).toContain('case EVENT_FIREBALL:');
    expect(cpp).toContain('    EventMap events;');
    expect(cpp).toContain('    RegisterCreatureAI(npc_guard);');
    expect(cpp).not.toContain('\n\n\n');
    expect(loader).toBe('void AddSC_npc_guard();\n    AddSC_npc_guard();');
    expect(sql).toBe("UPDATE `creature_template` SET `ScriptName` = 'npc_guard' WHERE `entry` = 68;");
  });

  it("makes a boss of an instance, with the instance's AI factory", () => {
    const cpp = scriptTemplate(options({ kind: 'boss', name: 'boss_hogger', instance: 'Stockade' })).files[0].text;
    expect(cpp).toContain('#include "stockade.h"');
    expect(cpp).toContain('struct boss_hogger : public BossAI');
    expect(cpp).toContain('BossAI(creature, DATA_HOGGER)');
    expect(cpp).toContain('BossAI::JustEngagedWith(who);');
    expect(cpp).not.toContain('EventMap events;');
    expect(cpp).toContain('RegisterCreatureAIWithFactory(boss_hogger, GetStockadeAI);');
    // (no instance named: a placeholder)
    expect(scriptTemplate(options({ kind: 'boss', name: 'boss_x' })).files[0].text).toContain('GetMyInstanceAI');
  });

  it('makes gameobject, spell and aura scripts, and the SQL naming spells', () => {
    expect(scriptTemplate(options({ kind: 'gameobject', name: 'go_chest' })).files[0].text).toContain('RegisterGameObjectAI(go_chest);');
    expect(scriptTemplate(options({ kind: 'gameobject', name: 'go_chest' })).sql).toContain('`gameobject_template`');
    const spell = scriptTemplate(options({ kind: 'spell', name: 'spell_gen_x', entry: 133, spells: [{ name: 'Burn', value: 1 }] }));
    expect(spell.files[0].text).toContain('class spell_gen_x : public SpellScript');
    expect(spell.files[0].text).toContain('PrepareSpellScript(spell_gen_x);');
    expect(spell.files[0].text).toContain('return ValidateSpellInfo({ SPELL_BURN });');
    expect(spell.files[0].text).toContain('OnEffectHitTarget += SpellEffectFn(spell_gen_x::HandleDummy, EFFECT_0, SPELL_EFFECT_DUMMY);');
    expect(spell.sql).toBe(
      "DELETE FROM `spell_script_names` WHERE `spell_id` = 133 AND `ScriptName` = 'spell_gen_x';\n" +
        "INSERT INTO `spell_script_names` (`spell_id`, `ScriptName`) VALUES (133, 'spell_gen_x');",
    );
    const aura = scriptTemplate(options({ kind: 'aura', name: 'spell_aura_x' })).files[0].text;
    expect(aura).toContain('class spell_aura_x : public AuraScript');
    expect(aura).toContain('PrepareAuraScript(spell_aura_x);');
    expect(aura).not.toContain('Validate');
    expect(aura).toContain('OnEffectPeriodic += AuraEffectPeriodicFn(spell_aura_x::HandlePeriodic, EFFECT_0, SPELL_AURA_PERIODIC_DUMMY);');
  });

  it('makes an instance: its header with the bosses and the AI factory, its script and the SQL', () => {
    const { files, sql } = scriptTemplate(
      options({ kind: 'instance', name: 'instance_stockade', instance: 'Stockade', entry: 34, bosses: ['Hogger', 'Dextren'] }),
    );
    expect(files.map((file) => file.name)).toEqual(['stockade.h', 'instance_stockade.cpp']);
    expect(files[0].text).toContain('#define DataHeader "STO"');
    expect(files[0].text).toContain('#define StockadeScriptName "instance_stockade"');
    expect(files[0].text).toContain('    DATA_HOGGER    = 0,');
    expect(files[0].text).toContain('    MAX_ENCOUNTERS = 2,');
    expect(files[0].text).toContain('inline AI* GetStockadeAI(T* obj)');
    expect(files[1].text).toContain('RegisterInstanceScript(instance_stockade, 34);');
    expect(sql).toBe("UPDATE `instance_template` SET `script` = 'instance_stockade' WHERE `map` = 34;");
    // no entry or name yet: placeholders
    const empty = scriptTemplate(options({ kind: 'instance', name: '', entry: undefined }));
    expect(empty.files[1].name).toBe('my_script.cpp');
    expect(empty.files[1].text).toContain('RegisterInstanceScript(my_script, 0);');
    expect(empty.files[0].text).toContain('    MAX_ENCOUNTERS = 0,');
  });
});
