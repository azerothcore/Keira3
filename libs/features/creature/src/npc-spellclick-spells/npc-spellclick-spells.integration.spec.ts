import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { NpcSpellclickSpells } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { NpcSpellclickSpellsComponent } from './npc-spellclick-spells.component';

class NpcSpellclickSpellsPage extends MultiRowEditorPageObject<NpcSpellclickSpellsComponent> {}

describe('NpcSpellclickSpells integration tests', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, TranslateTestingModule, NpcSpellclickSpellsComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        CreatureHandlerService,
        SaiCreatureHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    });
  });

  const setup = (creatingNew: boolean) => {
    const handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = '1234';
    handlerService.isNew = creatingNew;
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'queryValue').mockReturnValue(of());
    const existing = Object.assign(new NpcSpellclickSpells(), { npc_entry: 1234, spell_id: 7 });
    const selectAll = vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [existing]));
    const page = new NpcSpellclickSpellsPage(TestBed.createComponent(NpcSpellclickSpellsComponent));
    page.fixture.autoDetectChanges(true);
    page.fixture.detectChanges();
    return { page, querySpy, selectAll, handlerService };
  };

  it('reads the rows', () => {
    const { page, selectAll } = setup(false);

    expect(selectAll).toHaveBeenCalledWith('npc_spellclick_spells', 'npc_entry', '1234');
    expect(page.getEditorTableRowsCount()).toBe(1);
    expect(page.query('#editor-help')).toBeTruthy();
  });

  it('adds a row, then executes the query', () => {
    const { page, querySpy, handlerService } = setup(true);
    querySpy.mockClear();

    page.addNewRow();
    expect(handlerService.isNpcSpellclickSpellsUnsaved()).toBe(true);
    page.setInputValueById('f-spell-id', 55);

    const expected =
      'DELETE FROM `npc_spellclick_spells` WHERE (`npc_entry` = 1234) AND (`spell_id` IN (55));\n' +
      'INSERT INTO `npc_spellclick_spells` (`npc_entry`, `spell_id`, `cast_flags`, `user_type`) VALUES\n' +
      '(1234, 55, 0, 0);';
    page.expectDiffQueryToContain(expected);
    page.clickExecuteQuery();
    expect(querySpy.mock.calls.at(-1)?.[0]).toContain(expected);
  });
});
