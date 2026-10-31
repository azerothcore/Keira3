import { TestBed } from '@angular/core/testing';
import { ScriptSpawn } from '@keira/shared/wow-data';
import { click, settle, setupSourcePage, setValue } from '../scripts.testing';
import { ScriptSpawnsComponent } from './script-spawns.component';

describe('ScriptSpawnsComponent', () => {
  const spawn = (entry: number, file: string): ScriptSpawn => ({ entry, mapId: 489, x: 1, y: 2, z: 3, o: 0, file });
  const spawns = [spawn(179830, 'BattlegroundWS.cpp'), spawn(179831, 'BattlegroundWS.cpp'), spawn(12345, 'BattlegroundWS.cpp')];

  it('lists the gameobjects the scripts spawn (not the other candidates), filters them and shows one', async () => {
    const { page, fixture, navigate, querySpy } = setupSourcePage(
      ScriptSpawnsComponent,
      { getAllScriptSpawns: vi.fn().mockResolvedValue(spawns) },
      [
        [
          /gameobject_template/,
          [
            { entry: 179830, name: 'Silverwing Flag' },
            { entry: 179831, name: 'Warsong Flag' },
          ],
        ],
      ],
    );
    expect(page.query('#reading')).toBeTruthy();
    await settle(fixture);
    expect(querySpy).toHaveBeenCalledWith('SELECT entry, name FROM gameobject_template WHERE entry IN (179830, 179831, 12345)');
    expect(page.queryAll('#script-spawns tbody tr').length).toBe(2);
    click(page, '#show-0');
    expect(navigate).toHaveBeenCalledWith(['world-editor'], { queryParams: { map: 489, x: 1, y: 2, z: 3 } });
    setValue(page, '#spawn-filter', 'warsong');
    expect(page.queryAll('#script-spawns tbody tr').length).toBe(1);
  });

  it('says when the names can not be read', async () => {
    const { page, fixture } = setupSourcePage(ScriptSpawnsComponent, { getAllScriptSpawns: vi.fn().mockResolvedValue(spawns) }, [
      [/gameobject_template/, new Error('denied')],
    ]);
    await settle(fixture);
    expect(page.query('#source-error').textContent).toContain('denied');
  });

  it('reads no names without spawns, and takes no rows as none', async () => {
    const none = setupSourcePage(ScriptSpawnsComponent, { getAllScriptSpawns: vi.fn().mockResolvedValue([]) });
    await settle(none.fixture);
    expect(none.querySpy).not.toHaveBeenCalled();
    TestBed.resetTestingModule();
    const empty = setupSourcePage(ScriptSpawnsComponent, { getAllScriptSpawns: vi.fn().mockResolvedValue(spawns) }, [
      [/gameobject_template/, null],
    ]);
    await settle(empty.fixture);
    expect(empty.page.queryAll('#script-spawns tbody tr').length).toBe(0);
  });

  it('says when the source can not be read, or is not set', async () => {
    const failing = setupSourcePage(ScriptSpawnsComponent, { getAllScriptSpawns: vi.fn().mockRejectedValue(new Error('locked')) });
    await settle(failing.fixture);
    expect(failing.page.query('#source-error').textContent).toContain('locked');
    TestBed.resetTestingModule();
    const unset = setupSourcePage(ScriptSpawnsComponent, { getAllScriptSpawns: vi.fn() }, [], { source: '' });
    expect(unset.page.query('#no-source')).toBeTruthy();
  });
});
