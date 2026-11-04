import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { Conditions } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { ConditionsSourceHandlerService } from './conditions-source-handler.service';
import { ConditionsSourceComponent } from './conditions-source.component';

class ConditionsSourcePage extends MultiRowEditorPageObject<ConditionsSourceComponent> {
  get sourceName(): string {
    return this.query<HTMLElement>('#conditions-source-name').textContent ?? '';
  }
  get notUnique(): HTMLElement {
    return this.query<HTMLElement>('.form-error');
  }
}

describe('ConditionsSource integration tests', () => {
  const source = { SourceTypeOrReferenceId: 19, SourceGroup: 0, SourceEntry: 13117, SourceId: 0 };
  const condition = (fields: Partial<Conditions>): Conditions => Object.assign(new Conditions(), source, fields);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, TranslateTestingModule, ConditionsSourceComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        ConditionsSourceHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    });
  });

  const setup = (rows: Conditions[]) => {
    const handlerService = TestBed.inject(ConditionsSourceHandlerService);
    handlerService['_selected'] = JSON.stringify(source);
    handlerService.isNew = false;
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of(rows));
    vi.spyOn(queryService, 'queryValue').mockReturnValue(of());
    const page = new ConditionsSourcePage(TestBed.createComponent(ConditionsSourceComponent));
    page.fixture.autoDetectChanges(true);
    page.fixture.detectChanges();
    return { page, querySpy, handlerService };
  };

  it('lists every condition of the source, and writes nothing while unchanged', () => {
    const { page, querySpy } = setup([
      condition({ ConditionTypeOrReference: 8, ConditionValue1: 100 }),
      condition({ ElseGroup: 1, ConditionTypeOrReference: 9, ConditionValue1: 200 }),
    ]);

    expect(querySpy).toHaveBeenCalledWith(
      'SELECT * FROM `conditions` WHERE (SourceTypeOrReferenceId = 19) AND (SourceGroup = 0) AND (SourceEntry = 13117) AND (SourceId = 0)',
    );
    expect(page.getEditorTableRowsCount()).toBe(2);
    expect(page.sourceName).toContain('Quest 13117 available');
    page.expectDiffQueryToBeEmpty();
    page.expectFullQueryToContain(
      'DELETE FROM `conditions` WHERE `SourceTypeOrReferenceId` = 19 AND `SourceGroup` = 0 AND `SourceEntry` = 13117 AND `SourceId` = 0;',
    );
    page.expectFullQueryToContain("(19, 0, 13117, 0, 1, 9, 0, 200, 0, 0, 0, 0, 0, '', '')");
  });

  it('changes a condition with its pickers, and writes the whole source again', () => {
    const { page, handlerService } = setup([condition({ ConditionTypeOrReference: 8, ConditionValue1: 100 })]);

    page.clickRowOfDatatable(0);
    page.setInputValueById('ConditionValue1', 101);
    page.setInputValueById('ConditionValue1', 100);
    page.expectDiffQueryToBeEmpty();
    page.setInputValueById('ConditionValue1', 101);
    page.clickElement(page.query<HTMLButtonElement>('#generate-comment-btn'));

    expect(handlerService.isConditionsSourceUnsaved()).toBe(true);
    page.expectDiffQueryToContain('DELETE FROM `conditions` WHERE `SourceTypeOrReferenceId` = 19');
    page.expectDiffQueryToContain(
      "(19, 0, 13117, 0, 0, 8, 0, 101, 0, 0, 0, 0, 0, '', 'Quest 13117 available - Target has quest 101 rewarded')",
    );
  });

  it("shows the pickers of the selected row's condition type", () => {
    const { page } = setup([
      condition({ ConditionTypeOrReference: 47, ConditionValue1: 1 }),
      condition({ ConditionTypeOrReference: 27, ConditionValue1: 2 }),
    ]);

    page.clickRowOfDatatable(0);
    expect(page.query('#queststate-flag-selector')).toBeTruthy();
    page.clickRowOfDatatable(1);
    expect(page.query('#queststate-flag-selector', false)).toBeFalsy();
    expect(page.query('#ConditionValue2-selector-btn')).toBeTruthy();
  });

  it('adds conditions, telling apart two empty ones by their ElseGroup, and keeps the rows unique', () => {
    const { page } = setup([]);

    page.addNewRow();
    page.addNewRow();
    expect(page.getEditorTableRowsCount()).toBe(2);
    page.expectDiffQueryToContain("(19, 0, 13117, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '')");
    page.expectDiffQueryToContain("(19, 0, 13117, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, '', '')");

    page.setInputValueById('ElseGroup', 0);
    expect(page.notUnique.hidden).toBe(false);
  });

  it('deletes the last condition: only the delete is left', () => {
    const { page } = setup([condition({ ConditionTypeOrReference: 8 })]);

    page.deleteRow(0);

    page.expectDiffQueryToContain('DELETE FROM `conditions` WHERE');
    expect(page.queryPo.diffQueryWrapper.innerText).not.toContain('INSERT');
  });
});
