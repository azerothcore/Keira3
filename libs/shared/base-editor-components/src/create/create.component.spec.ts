import { TestBed, waitForAsync } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MockHandlerService } from '@keira/shared/base-abstract-classes';
import { TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { of, throwError } from 'rxjs';
import { anything, instance, mock, reset, when } from 'ts-mockito';
import { CreateComponent } from './create.component';

class CreateComponentPage extends PageObject<CreateComponent<TableRow>> {
  get idInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('#id');
  }
  get selectBtn(): HTMLInputElement {
    return this.query<HTMLInputElement>('#select-button');
  }
  get idFreeStatusBox(): HTMLDivElement {
    return this.query<HTMLDivElement>('#id-free-status');
  }
}

describe('CreateComponent', () => {
  const mockTable = 'mock_table';
  const mockId = 'mockId';
  const takenId = 100;
  const maxId = 12;
  const MAX_INT_UNSIGNED_VALUE = 4294967295;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserModule, FormsModule, TranslateTestingModule, CreateComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  }));

  function setup() {
    const spyError = spyOn(console, 'error');

    const MockedMysqlQueryService = mock(MysqlQueryService);
    when(MockedMysqlQueryService.getMaxId(mockTable, mockId)).thenReturn(of([{ max: maxId }]));
    when(MockedMysqlQueryService.selectAll(mockTable, mockId, anything())).thenReturn(of([]));
    when(MockedMysqlQueryService.selectAll(mockTable, mockId, takenId)).thenReturn(of([{}]));

    const fixture = TestBed.createComponent(CreateComponent);
    const component = fixture.componentInstance;
    component.entityTable = mockTable;
    component.entityIdField = mockId;
    component.handlerService = instance(mock(MockHandlerService));
    component.queryService = instance(MockedMysqlQueryService);
    component.maxEntryValue = MAX_INT_UNSIGNED_VALUE;
    const page = new CreateComponentPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { component, fixture, page, spyError, MockedMysqlQueryService };
  }

  it('should display the next id by default', waitForAsync(async () => {
    const { fixture, page, component } = setup();
    await fixture.whenStable();
    expect(page.idInput.value).toEqual(`${maxId + 1}`);
    expect(component.loading).toBe(false);
  }));

  it('should correctly toggle id free status the message', () => {
    const { page, component } = setup();
    page.setInputValue(page.idInput, takenId);
    expect(page.idFreeStatusBox.innerHTML).toContain('CREATE.ALREADY_USE');

    page.setInputValue(page.idInput, takenId + 1);
    expect(page.idFreeStatusBox.innerHTML).toContain('CREATE.FREE_ENTRY');

    expect(component.loading).toBe(false);
  });

  it('should correctly show console errors if any', () => {
    const { component, MockedMysqlQueryService, spyError } = setup();
    reset(MockedMysqlQueryService);
    when(MockedMysqlQueryService.getMaxId(mockTable, mockId)).thenReturn(throwError('error'));
    when(MockedMysqlQueryService.selectAll(mockTable, mockId, anything())).thenReturn(throwError('error'));

    component.checkId();
    component['getNextId']();

    expect(spyError).toHaveBeenCalledTimes(2);
    expect(component.loading).toBe(false);
  });

  it('if queryService param is not passed, should not call getNextId', () => {
    const { component } = setup();
    const spyGetNextId = spyOn<any>(component, 'getNextId');
    component.queryService = undefined as any;

    component.ngOnInit();

    expect(spyGetNextId).toHaveBeenCalledTimes(0);
  });

  it('clicking the button should correctly trigger the selection', () => {
    const { page, component } = setup();
    const selectSpy = spyOn(component.handlerService, 'select');
    const id = 1234;
    page.setInputValue(page.idInput, id);

    page.clickElement(page.selectBtn);

    expect(selectSpy).toHaveBeenCalledTimes(1);
    expect(selectSpy).toHaveBeenCalledWith(true, id);
  });

  it('does not allow a higher value than max value', () => {
    const { component } = setup();
    const unallowedIdValue = MAX_INT_UNSIGNED_VALUE + 1;
    component.idModel = unallowedIdValue;

    component['checkMaxValue']();

    expect(component.idModel).toEqual(MAX_INT_UNSIGNED_VALUE);
  });

  it('the customStartId should be preferred when greater than the currentMax', () => {
    const { component } = setup();
    component.customStartingId = 10;
    expect(component['calculateNextId'](5)).toEqual(10);
  });
});
