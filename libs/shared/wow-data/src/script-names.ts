/**
 * The script names the AzerothCore source registers (what `ScriptName` columns name): `RegisterCreatureAI(npc_x)` and
 * the instances' own `Register…CreatureAI(…)`, `RegisterGameObjectAI`, `RegisterSpellScript`, `RegisterInstanceScript`,
 * and the classes passing their name to `CreatureScript("…")`, `AreaTriggerScript("…")`…
 */

/** What a script is for (which table names it). */
export type ScriptKind =
  | 'creature'
  | 'gameobject'
  | 'spell'
  | 'instance'
  | 'areatrigger'
  | 'item'
  | 'achievement'
  | 'outdoorpvp'
  | 'command'
  | 'condition'
  | 'transport'
  | 'weather'
  | 'other';

/** A script the source registers: its name, what it's for and the file (path from the source folder). */
export interface ScriptName {
  name: string;
  kind: ScriptKind;
  file: string;
  /** The line it's registered at (1 first). */
  line?: number;
  /** The file on this computer. */
  path?: string;
}

/** Where a file of the core is on GitHub (master), at a line; undefined for a module's (its repository isn't known). */
export function scriptGithubUrl(script: Pick<ScriptName, 'file' | 'line'>): string | undefined {
  if (!script.file || script.file.startsWith('modules/')) {
    return undefined;
  }
  return `https://github.com/azerothcore/azerothcore-wotlk/blob/master/src/server/${script.file}${script.line ? `#L${script.line}` : ''}`;
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
  ConditionScript: 'condition',
  TransportScript: 'transport',
  WeatherScript: 'weather',
};

/** The scripts a source file registers (macro definitions left out). */
export function parseScriptNames(text: string, file: string): ScriptName[] {
  // (comments and defines blanked, their lines kept: the lines found are the file's)
  const blank = (part: string) => part.replace(/[^\n]/g, ' ');
  const code = text
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/\/\/[^\n]*/g, blank)
    .replace(/^\s*#\s*define[^\n]*(\\\n[^\n]*)*/gm, blank);
  const found = new Map<string, ScriptName>();
  let at = 0;
  const lineAt = (index: number) => code.slice(0, index).split('\n').length;
  const add = (name: string, kind: ScriptKind) => {
    if (!found.has(name)) {
      found.set(name, { name, kind, file, line: lineAt(at) });
    }
  };
  for (const m of code.matchAll(/\bRegister(\w*?)(GameObjectAI|CreatureAI|AI)(?:WithFactory)?\(\s*(\w+)/g)) {
    at = m.index as number;
    add(m[3], m[2] === 'GameObjectAI' ? 'gameobject' : 'creature');
  }
  for (const m of code.matchAll(/\bRegisterSpellScript\(\s*(\w+)/g)) {
    at = m.index as number;
    add(m[1], 'spell');
  }
  for (const m of code.matchAll(/\bRegisterSpellScriptWithArgs\(\s*\w+\s*,\s*"(\w+)"/g)) {
    at = m.index as number;
    add(m[1], 'spell');
  }
  for (const m of code.matchAll(/\bRegisterSpellAndAuraScriptPair\(\s*(\w+)/g)) {
    at = m.index as number;
    add(m[1], 'spell');
  }
  for (const m of code.matchAll(/\bRegisterSpellAndAuraScriptPairWithArgs\(\s*\w+\s*,\s*\w+\s*,\s*"(\w+)"/g)) {
    at = m.index as number;
    add(m[1], 'spell');
  }
  for (const m of code.matchAll(/\bRegisterInstanceScript\(\s*(\w+)/g)) {
    at = m.index as number;
    add(m[1], 'instance');
  }
  for (const m of code.matchAll(/\b(\w+)\(\s*"(\w+)"/g)) {
    at = m.index as number;
    const kind = CLASS_KINDS[m[1]];
    if (kind) {
      add(m[2], kind);
    }
  }
  return [...found.values()];
}
