import { parseScriptNames, scriptGithubUrl } from './script-names';

describe('parseScriptNames', () => {
  it('reads the names the scripts register, and what for', () => {
    const text = `
      #define RegisterUlduarCreatureAI(ai_name) RegisterCreatureAIWithFactory(ai_name, GetUlduarAI)
      class npc_old : public CreatureScript { public: npc_old() : CreatureScript("npc_old") { } };
      class at_door : public OnlyOnceAreaTriggerScript { at_door() : OnlyOnceAreaTriggerScript("at_door") { } };
      class go_chest : public GameObjectScript { go_chest() : GameObjectScript("go_chest") { } };
      class cs_x : public CommandScript { cs_x() : CommandScript("cs_x") { } };
      class not_a_script { void Say(const char* text); };
      void AddSC_test() {
        RegisterCreatureAI(npc_guard);
        RegisterUlduarCreatureAI(boss_xt002);
        RegisterSerpentShrineAI(boss_vashj);
        RegisterGameObjectAI(go_banner);
        RegisterSpellScript(spell_fire);
        RegisterSpellScriptWithArgs(spell_generic, "spell_ice", 1, 2);
        RegisterSpellAndAuraScriptPair(spell_pair, spell_pair_aura);
        RegisterSpellAndAuraScriptPairWithArgs(spell_a, spell_b, "spell_named");
        RegisterInstanceScript(instance_ulduar, 603);
        // RegisterCreatureAI(npc_commented);
        Say("hello");
        RegisterCreatureAI(npc_guard);
      }`;
    expect(parseScriptNames(text, 'scripts/x.cpp').map(({ name, kind }) => `${kind}:${name}`)).toEqual([
      'creature:npc_guard',
      'creature:boss_xt002',
      'creature:boss_vashj',
      'gameobject:go_banner',
      'spell:spell_fire',
      'spell:spell_ice',
      'spell:spell_pair',
      'spell:spell_named',
      'instance:instance_ulduar',
      'creature:npc_old',
      'areatrigger:at_door',
      'gameobject:go_chest',
      'command:cs_x',
    ]);
    const [guard, , , , , , , , , old] = parseScriptNames(text, 'scripts/x.cpp');
    expect(guard.file).toBe('scripts/x.cpp');
    // the lines of the file (the define and comments above don't shift them)
    expect([guard.line, old.line]).toEqual([9, 3]);
  });

  it("links a core file to GitHub at its line, not a module's", () => {
    expect(scriptGithubUrl({ file: 'scripts/Commands/cs_account.cpp', line: 12 })).toBe(
      'https://github.com/azerothcore/azerothcore-wotlk/blob/master/src/server/scripts/Commands/cs_account.cpp#L12',
    );
    expect(scriptGithubUrl({ file: 'scripts/x.cpp' })).toBe(
      'https://github.com/azerothcore/azerothcore-wotlk/blob/master/src/server/scripts/x.cpp',
    );
    expect(scriptGithubUrl({ file: 'modules/mod-x/src/x.cpp', line: 1 })).toBeUndefined();
    expect(scriptGithubUrl({ file: '' })).toBeUndefined();
  });
});
