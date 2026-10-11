import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CreatureImmunities } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { CreatureImmunitiesHandlerService } from '../creature-immunities-handler.service';
import { CreatureImmunitiesComponent } from './creature-immunities.component';

describe('CreatureImmunities integration tests', () => {
  class CreatureImmunitiesPage extends EditorPageObject<CreatureImmunitiesComponent> {
    getCheckbox(id: string): HTMLInputElement {
      return this.query<HTMLInputElement>(`#${id}`);
    }

    getModalRows(tableSelector: string): HTMLTableRowElement[] {
      return Array.from(document.querySelectorAll<HTMLTableRowElement>(`${tableSelector} tbody tr`));
    }

    getSwitchState(rows: HTMLTableRowElement[], rowIndex: number): string | null {
      return rows[rowIndex].querySelector('ui-switch button.switch')?.getAttribute('aria-checked') ?? null;
    }

    async openSelector(fieldId: string): Promise<void> {
      this.clickElement(this.getSelectorBtn(fieldId));
      this.expectModalDisplayed();
      await this.whenReady();
    }

    async toggleOptionRows(rowIndexes: number[]): Promise<void> {
      for (const rowIndex of rowIndexes) {
        const cell = this.getCellOfTableExternal('#options-table', rowIndex, 0);
        this.clickElement(cell.querySelector<HTMLElement>('ui-switch') as HTMLElement);
        await this.whenReady();
      }
    }
  }

  const ID_95 = 95;
  const ID_368 = -368;
  const ID_380 = -380;
  const ID_477 = 477;
  const ID_EMPTY = -500;
  const ID_NEW = -431;

  const COMMENT_368 =
    'school=0x7F(NORMAL|HOLY|FIRE|NATURE|FROST|SHADOW|ARCANE), ' +
    'mech=0x26CB7F5F(CHARM|DISORIENTED|DISARM|DISTRACT|FEAR|ROOT|SILENCE|SLEEP|SNARE|STUN|FREEZE|KNOCKOUT|BLEED|' +
    'POLYMORPH|BANISH|SHACKLE|TURN|HORROR|INTERRUPT|DAZE|SAPPED)';
  const COMMENT_380 =
    'mech=0x34C73F7F(CHARM|DISORIENTED|DISARM|DISTRACT|FEAR|GRIP|ROOT|SILENCE|SLEEP|SNARE|STUN|FREEZE|KNOCKOUT|' +
    'POLYMORPH|BANISH|SHIELD|TURN|HORROR|DAZE|IMMUNE_SHIELD|SAPPED), effects=114(ATTACK_ME), auras=11(MOD_TAUNT)';
  const COMMENT_SCHOOL_ONLY = 'school=0x7F(NORMAL|HOLY|FIRE|NATURE|FROST|SHADOW|ARCANE)';

  const COLUMNS =
    '(`ID`, `SchoolMask`, `DispelTypeMask`, `MechanicsMask`, `Effects`, `Auras`, `ImmuneAoE`, `ImmuneChain`, `Comment`) VALUES';

  const entity95 = Object.assign(new CreatureImmunities(), {
    ID: ID_95,
    MechanicsMask: 32,
    ImmuneAoE: 1,
    Comment: 'Immune to Fear',
  });

  const entity368 = Object.assign(new CreatureImmunities(), { ID: ID_368, SchoolMask: 127, MechanicsMask: 1301741246 });

  const entity380 = Object.assign(new CreatureImmunities(), {
    ID: ID_380,
    MechanicsMask: 1770946302,
    Effects: '114',
    Auras: '11',
  });

  const entity477 = Object.assign(new CreatureImmunities(), { ID: ID_477, MechanicsMask: 2 ** 36 });

  const entityWithCsv = Object.assign(new CreatureImmunities(), { ID: ID_EMPTY, Effects: '98,145' });

  const schoolOnlyRow = Object.assign(new CreatureImmunities(), { ID: ID_EMPTY, SchoolMask: 127 });

  const emptyMaskRow = Object.assign(new CreatureImmunities(), { ID: ID_EMPTY });

  const fullQueryOf = (row: CreatureImmunities): string =>
    'DELETE FROM `creature_immunities` WHERE (`ID` = ' +
    row.ID +
    ');\n' +
    'INSERT INTO `creature_immunities` ' +
    COLUMNS +
    '\n' +
    `(${row.ID}, ${row.SchoolMask}, ${row.DispelTypeMask}, ${row.MechanicsMask}, '${row.Effects}', '${row.Auras}', ` +
    `${row.ImmuneAoE}, ${row.ImmuneChain}, '${row.Comment}');\n`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, TranslateTestingModule],
      declarations: [],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        CreatureImmunitiesHandlerService,
        {
          provide: SqliteService,
          useValue: instance(mock(SqliteService)),
        },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean, entity: CreatureImmunities = entity95, id: number = entity.ID) {
    const handlerService = TestBed.inject(CreatureImmunitiesHandlerService);
    (handlerService as any)._selected = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [entity]));

    const fixture = TestBed.createComponent(CreatureImmunitiesComponent);
    const page = new CreatureImmunitiesPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { page, querySpy, handlerService };
  }

  describe('Editing an existing entry', () => {
    it('should correctly initialise every column of an existing entry', () => {
      const { page } = setup(false, entity95);

      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(fullQueryOf(entity95));

      expect(page.getInputById('ID').value).toBe(`${ID_95}`);
      expect(page.getInputById('SchoolMask').value).toBe('0');
      expect(page.getInputById('DispelTypeMask').value).toBe('0');
      expect(page.getInputById('MechanicsMask').value).toBe('32');
      expect(page.getInputById('Effects').value).toBe('');
      expect(page.getInputById('Auras').value).toBe('');
      expect(page.getCheckbox('ImmuneAoE').checked).toBe(true);
      expect(page.getCheckbox('ImmuneChain').checked).toBe(false);
      expect(page.getInputById('Comment').value).toBe('Immune to Fear');
    });

    it('should correctly initialise the stored CSV values', () => {
      const { page } = setup(false, entity380);

      expect(page.getInputById('Effects').value).toBe('114');
      expect(page.getInputById('Auras').value).toBe('11');
      expect(page.getInputById('MechanicsMask').value).toBe('1770946302');
    });

    it('should toggle the SchoolMask checklist', async () => {
      const { page } = setup(false, emptyMaskRow);

      const value = await page.openFlagsAndToggle('SchoolMask', [0, 1, 2, 3, 4, 5, 6]);

      expect(value).toBe(127);
      page.expectDiffQueryToContain(`UPDATE \`creature_immunities\` SET \`SchoolMask\` = 127 WHERE (\`ID\` = ${ID_EMPTY});`);
    });

    it('should show the dispel type checklist without the NONE entry', async () => {
      const { page } = setup(false, entity95);

      await page.openSelector('DispelTypeMask');

      const rows = page.getModalRows('#flags-table');
      expect(rows.length).toBe(11);
      expect(page.getCellOfTableExternal('#flags-table', 0, 1).innerText.trim()).toBe('1');
      expect(page.getCellOfTableExternal('#flags-table', 0, 3).innerText.trim()).toBe('Magic');
      expect(page.getCellOfTableExternal('#flags-table', 10, 1).innerText.trim()).toBe('11');

      page.clickModalCancel();
      await page.whenReady();
    });

    it('should toggle the DispelTypeMask checklist', async () => {
      const { page } = setup(false, entity95);

      const value = await page.openFlagsAndToggle('DispelTypeMask', [0]);

      expect(value).toBe(2);
      page.expectDiffQueryToContain(`UPDATE \`creature_immunities\` SET \`DispelTypeMask\` = 2 WHERE (\`ID\` = ${ID_95});`);
    });

    it('should show the mechanics of the stored mask as checked', async () => {
      const { page } = setup(false, entity95);

      await page.openSelector('MechanicsMask');

      const rows = page.getModalRows('#flags-table');
      expect(rows.length).toBe(36);
      // the first row is bit 1 (CHARM), so the row index is the bit minus one
      expect(rows[4].innerText).toContain('FEAR');
      expect(page.getSwitchState(rows, 4)).toBe('true');
      expect(rows[11].innerText).toContain('STUN');
      expect(page.getSwitchState(rows, 11)).toBe('false');

      page.clickModalCancel();
      await page.whenReady();
    });

    it('should show a mechanics bit above 31 as checked', async () => {
      const { page } = setup(false, entity477);

      await page.openSelector('MechanicsMask');

      const rows = page.getModalRows('#flags-table');
      expect(rows[35].innerText).toContain('TAUNTED');
      expect(page.getSwitchState(rows, 35)).toBe('true');

      page.clickModalCancel();
      await page.whenReady();
    });

    it('should toggle the MechanicsMask checklist', async () => {
      const { page } = setup(false, emptyMaskRow);

      const value = await page.openFlagsAndToggle('MechanicsMask', [11]);

      expect(value).toBe(4096);
      page.expectDiffQueryToContain(`UPDATE \`creature_immunities\` SET \`MechanicsMask\` = 4096 WHERE (\`ID\` = ${ID_EMPTY});`);
    });

    it('should list the effects without the NONE entry', async () => {
      const { page } = setup(false, entity95);

      await page.openSelector('Effects');

      const rows = page.getModalRows('#options-table');
      expect(rows.length).toBe(164);
      expect(page.getCellOfTableExternal('#options-table', 0, 1).innerText.trim()).toBe('1');
      expect(page.getCellOfTableExternal('#options-table', 163, 1).innerText.trim()).toBe('164');

      page.clickModalCancel();
      await page.whenReady();
    });

    it('should list the auras without the NONE entry', async () => {
      const { page } = setup(false, entity95);

      await page.openSelector('Auras');

      const rows = page.getModalRows('#options-table');
      expect(rows.length).toBe(316);
      expect(page.getCellOfTableExternal('#options-table', 0, 1).innerText.trim()).toBe('1');
      expect(page.getCellOfTableExternal('#options-table', 315, 1).innerText.trim()).toBe('316');

      page.clickModalCancel();
      await page.whenReady();
    });

    it('should write the selected effects as an ascending CSV', async () => {
      const { page } = setup(false, entity95);

      await page.openSelector('Effects');
      // row index = value - 1, because the NONE entry is not offered
      await page.toggleOptionRows([144, 97]);
      page.clickModalSelect();
      await page.whenReady();

      expect(page.getInputById('Effects').value).toBe('98,145');
      page.expectDiffQueryToContain(`UPDATE \`creature_immunities\` SET \`Effects\` = '98,145' WHERE (\`ID\` = ${ID_95});`);
    });

    it('should write the selected auras as an ascending CSV', async () => {
      const { page } = setup(false, entity95);

      await page.openSelector('Auras');
      await page.toggleOptionRows([10]);
      page.clickModalSelect();
      await page.whenReady();

      expect(page.getInputById('Auras').value).toBe('11');
      page.expectDiffQueryToContain(`UPDATE \`creature_immunities\` SET \`Auras\` = '11' WHERE (\`ID\` = ${ID_95});`);
    });

    it('should write an empty string when the selection is cleared', async () => {
      const { page } = setup(false, entityWithCsv);

      await page.openSelector('Effects');
      await page.toggleOptionRows([97, 144]);
      page.clickModalSelect();
      await page.whenReady();

      expect(page.getInputById('Effects').value).toBe('');
      page.expectDiffQueryToContain(`UPDATE \`creature_immunities\` SET \`Effects\` = '' WHERE (\`ID\` = ${ID_EMPTY});`);
    });

    it('should save hand-typed CSV values verbatim', () => {
      const { page } = setup(false, entity95);

      page.setInputValueById('Effects', '98,144');
      page.setInputValueById('Auras', '11');

      page.expectDiffQueryToContain(
        `UPDATE \`creature_immunities\` SET \`Effects\` = '98,144', \`Auras\` = '11' WHERE (\`ID\` = ${ID_95});`,
      );
    });

    it('should toggle a checked boolean flag to 0', () => {
      const { page } = setup(false, entity95);

      page.clickElement(page.getCheckbox('ImmuneAoE'));

      expect(page.getCheckbox('ImmuneAoE').checked).toBe(false);
      page.expectDiffQueryToContain(`UPDATE \`creature_immunities\` SET \`ImmuneAoE\` = 0 WHERE (\`ID\` = ${ID_95});`);
    });

    it('should toggle an unchecked boolean flag to 1', () => {
      const { page } = setup(false, entity95);

      page.clickElement(page.getCheckbox('ImmuneChain'));

      expect(page.getCheckbox('ImmuneChain').checked).toBe(true);
      page.expectDiffQueryToContain(`UPDATE \`creature_immunities\` SET \`ImmuneChain\` = 1 WHERE (\`ID\` = ${ID_95});`);
    });

    it('should have an empty diff query when a flag is toggled back', () => {
      const { page } = setup(false, entity95);

      page.clickElement(page.getCheckbox('ImmuneAoE'));
      page.clickElement(page.getCheckbox('ImmuneAoE'));

      expect(page.getCheckbox('ImmuneAoE').checked).toBe(true);
      page.expectDiffQueryToBeEmpty();
    });
  });

  describe('Generate Comment', () => {
    it('should generate the comment of a school + mechanics entry', () => {
      const { page } = setup(false, entity368);

      page.clickElement(page.queryOutsideComponent<HTMLButtonElement>('#generate-comment-btn'));

      expect(page.getInputById('Comment').value).toBe(COMMENT_368);
      expect(page.getInputById('Comment').value).not.toContain('flags=');
      page.expectDiffQueryToContain(`\`Comment\` = '${COMMENT_368}'`);
    });

    it('should generate the comment of a mechanics + effects + auras entry without a flags part', () => {
      const { page } = setup(false, entity380);

      page.clickElement(page.queryOutsideComponent<HTMLButtonElement>('#generate-comment-btn'));

      expect(page.getInputById('Comment').value).toBe(COMMENT_380);
      expect(page.getInputById('Comment').value).not.toContain('flags=');
      page.expectDiffQueryToContain(`\`Comment\` = '${COMMENT_380}'`);
    });

    it('should generate a school-only comment', () => {
      const { page } = setup(false, schoolOnlyRow);

      page.clickElement(page.queryOutsideComponent<HTMLButtonElement>('#generate-comment-btn'));

      expect(page.getInputById('Comment').value).toBe(COMMENT_SCHOOL_ONLY);
      page.expectDiffQueryToContain(`\`Comment\` = '${COMMENT_SCHOOL_ONLY}'`);
    });

    it('should keep a hand-typed comment unchanged', () => {
      const { page } = setup(false, entity95);

      page.setInputValueById('Comment', 'my own comment');

      expect(page.getInputById('Comment').value).toBe('my own comment');
      page.expectDiffQueryToContain(`\`Comment\` = 'my own comment'`);
    });
  });

  describe('Creating a new entry', () => {
    const expectedCreateQuery =
      'DELETE FROM `creature_immunities` WHERE (`ID` = -431);\n' +
      'INSERT INTO `creature_immunities` (`ID`, `SchoolMask`, `DispelTypeMask`, `MechanicsMask`, `Effects`, `Auras`, ' +
      '`ImmuneAoE`, `ImmuneChain`, `Comment`) VALUES\n' +
      "(-431, 0, 0, 0, '', '', 0, 0, '');\n";

    it('should correctly initialise the create query', () => {
      const { page } = setup(true, new CreatureImmunities(), ID_NEW);

      page.expectQuerySwitchToBeHidden();
      page.expectFullQueryToBeShown();
      page.expectFullQueryToContain(expectedCreateQuery);
    });

    it('should execute the full query of a new entry', () => {
      const { page, querySpy } = setup(true, new CreatureImmunities(), ID_NEW);
      querySpy.mockClear();

      const expectedQuery =
        'DELETE FROM `creature_immunities` WHERE (`ID` = -431);\n' +
        'INSERT INTO `creature_immunities` (`ID`, `SchoolMask`, `DispelTypeMask`, `MechanicsMask`, `Effects`, `Auras`, ' +
        '`ImmuneAoE`, `ImmuneChain`, `Comment`) VALUES\n' +
        "(-431, 127, 1, 4096, '98,145', '11', 1, 0, 'my comment');\n";

      page.setInputValueById('SchoolMask', 127);
      page.setInputValueById('DispelTypeMask', 1);
      page.setInputValueById('MechanicsMask', 4096);
      page.setInputValueById('Effects', '98,145');
      page.setInputValueById('Auras', '11');
      page.clickElement(page.getCheckbox('ImmuneAoE'));
      page.setInputValueById('Comment', 'my comment');

      page.expectFullQueryToContain(expectedQuery);

      page.clickExecuteQuery();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.mock.calls.at(-1)[0]).toBe(expectedQuery);
    });

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true, new CreatureImmunities(), ID_NEW);

      expect(handlerService.isCreatureImmunitiesUnsaved()).toBe(false);

      page.setInputValueById('Comment', 'ABC');
      expect(handlerService.isCreatureImmunitiesUnsaved()).toBe(true);

      page.setInputValueById('Comment', '');
      expect(handlerService.isCreatureImmunitiesUnsaved()).toBe(false);
    });
  });
});
