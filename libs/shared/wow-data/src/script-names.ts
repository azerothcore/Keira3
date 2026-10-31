/**
 * The script names the AzerothCore source registers (what `ScriptName` columns name): `RegisterCreatureAI(npc_x)` and
 * the instances' own `Register…CreatureAI(…)`, `RegisterGameObjectAI`, `RegisterSpellScript`, `RegisterInstanceScript`,
 * and the classes passing their name to `CreatureScript("…")`, `AreaTriggerScript("…")`…
 */

/** What a script is for (which table names it). */
export type ScriptKind =
  'creature' | 'gameobject' | 'spell' | 'instance' | 'areatrigger' | 'item' | 'achievement' | 'outdoorpvp' | 'command' | 'other';

/** A script the source registers: its name, what it's for and the file (path from the source folder). */
export interface ScriptName {
  name: string;
  kind: ScriptKind;
  file: string;
}

const CLASS_KINDS: Record<string, ScriptKind> = {
  CreatureScript: 'creature',
  GameObjectScript: 'gameobject',
  AreaTriggerScript: 'areatrigger',
  OnlyOnceAreaTriggerScript: 'areatrigger',
  ItemScript: 'item',
  InstanceMapScript: 'instance',
  SpellScriptLoader: 'spell',
  AchievementCriteriaScript: 'achievement',
  OutdoorPvPScript: 'outdoorpvp',
  CommandScript: 'command',
};

/** The scripts a source file registers (macro definitions left out). */
export function parseScriptNames(text: string, file: string): ScriptName[] {
  const code = text
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
    .replace(/^\s*#\s*define[^\n]*(\\\n[^\n]*)*/gm, ' ');
  const found = new Map<string, ScriptName>();
  const add = (name: string, kind: ScriptKind) => {
    if (!found.has(name)) {
      found.set(name, { name, kind, file });
    }
  };
  for (const m of code.matchAll(/\bRegister(\w*?)(GameObjectAI|CreatureAI|AI)(?:WithFactory)?\(\s*(\w+)/g)) {
    add(m[3], m[2] === 'GameObjectAI' ? 'gameobject' : 'creature');
  }
  for (const m of code.matchAll(/\bRegisterSpellScript\(\s*(\w+)/g)) {
    add(m[1], 'spell');
  }
  for (const m of code.matchAll(/\bRegisterSpellScriptWithArgs\(\s*\w+\s*,\s*"(\w+)"/g)) {
    add(m[1], 'spell');
  }
  for (const m of code.matchAll(/\bRegisterSpellAndAuraScriptPair\(\s*(\w+)/g)) {
    add(m[1], 'spell');
  }
  for (const m of code.matchAll(/\bRegisterSpellAndAuraScriptPairWithArgs\(\s*\w+\s*,\s*\w+\s*,\s*"(\w+)"/g)) {
    add(m[1], 'spell');
  }
  for (const m of code.matchAll(/\bRegisterInstanceScript\(\s*(\w+)/g)) {
    add(m[1], 'instance');
  }
  for (const m of code.matchAll(/\b(\w+)\(\s*"(\w+)"/g)) {
    const kind = CLASS_KINDS[m[1]];
    if (kind) {
      add(m[2], kind);
    }
  }
  return [...found.values()];
}
