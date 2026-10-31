import { ScriptName } from '@keira/shared/wow-data';
import { TestBed } from '@angular/core/testing';
import { click, settle, setupSourcePage, setValue } from '../scripts.testing';
import { SCRIPT_NAMES_SHOWN, ScriptNamesComponent } from './script-names.component';

describe('ScriptNamesComponent', () => {
  const names: ScriptName[] = [
    { name: 'npc_guard', kind: 'creature', file: 'scripts/World/npcs.cpp' },
    { name: 'go_chest', kind: 'gameobject', file: 'scripts/World/go.cpp' },
    { name: 'spell_fire', kind: 'spell', file: 'scripts/Spells/mage.cpp' },
  ];
  const answers: [RegExp, unknown][] = [
    [
      /FROM creature_template/,
      [
        { id: 1, name: 'Guard', scriptName: 'npc_guard' },
        { id: 2, name: 'Old', scriptName: 'npc_gone' },
      ],
    ],
    [/FROM gameobject_template/, [{ id: 3, name: 'Chest', scriptName: 'go_chest' }]],
    [/FROM areatrigger_scripts/, [{ id: 9, name: null, scriptName: 'at_x' }]],
    [/FROM spell_script_names/, null],
    [/FROM item_template/, new Error('no table')],
  ];

  it('lists the scripts with what uses them, filters them and opens the users', async () => {
    const { page, fixture, links } = setupSourcePage(ScriptNamesComponent, { getScriptNames: vi.fn().mockResolvedValue(names) }, answers);
    expect(page.query('#reading')).toBeTruthy();
    await settle(fixture);
    expect(page.queryAll('#script-names tbody tr').length).toBe(3);
    click(page, '#users-npc_guard');
    expect(page.query('#user-list-npc_guard').textContent).toContain('Guard');
    click(page, '#open-creature-1');
    expect(links.openCreature).toHaveBeenCalledWith(1, 'Guard');
    click(page, '#users-npc_guard');
    expect(page.query('#user-list-npc_guard', false)).toBeFalsy();
    click(page, '#users-go_chest');
    click(page, '#open-gameobject-3');
    expect(links.openGameObject).toHaveBeenCalledWith(3, 'Chest');
    // by name or file, by kind, unused, missing from the source
    setValue(page, '#script-filter', 'mage');
    expect(page.queryAll('#script-names tbody tr').length).toBe(1);
    setValue(page, '#script-filter', '');
    setValue(page, '#script-kind', 'creature');
    expect(page.queryAll('#script-names tbody tr').length).toBe(1);
    setValue(page, '#script-kind', '');
    setValue(page, '#script-show', 'unused');
    expect(page.query('#script-names').textContent).toContain('spell_fire');
    expect(page.query('#script-names').textContent).not.toContain('npc_guard');
    setValue(page, '#script-show', 'missing');
    expect(page.query('#script-names').textContent).toContain('npc_gone');
    setValue(page, '#script-kind', 'creature');
    expect(page.queryAll('#script-names tbody tr').length).toBe(1);
    setValue(page, '#script-kind', 'gameobject');
    expect(page.queryAll('#script-names tbody tr').length).toBe(0);
    expect(SCRIPT_NAMES_SHOWN).toBe(200);
  });

  it('shows at most so many, and works without the other editors', async () => {
    const many = Array.from({ length: SCRIPT_NAMES_SHOWN + 5 }, (_, i) => ({ name: `npc_${i}`, kind: 'creature' as const, file: 'f.cpp' }));
    const { page, fixture } = setupSourcePage(
      ScriptNamesComponent,
      { getScriptNames: vi.fn().mockResolvedValue(many) },
      [[/FROM creature_template/, [{ id: 1, name: 'A', scriptName: 'npc_0' }]]],
      { links: false },
    );
    await settle(fixture);
    expect(page.queryAll('#script-names tbody tr').length).toBe(SCRIPT_NAMES_SHOWN);
    click(page, '#users-npc_0');
    expect(page.query('#open-creature-1', false)).toBeFalsy();
  });

  it('says when the source can not be read, or is not set', async () => {
    const failing = setupSourcePage(ScriptNamesComponent, { getScriptNames: vi.fn().mockRejectedValue(new Error('locked')) });
    await settle(failing.fixture);
    expect(failing.page.query('#source-error').textContent).toContain('locked');
    TestBed.resetTestingModule();
    const unset = setupSourcePage(ScriptNamesComponent, { getScriptNames: vi.fn() }, [], { source: '' });
    expect(unset.page.query('#no-source')).toBeTruthy();
  });
});
