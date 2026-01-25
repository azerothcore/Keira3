import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MockHandlerService } from '@keira/shared/base-abstract-classes';
import { TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { anything, instance, mock, reset, when } from 'ts-mockito';

import { CreateComponent } from './create.component';

class CreateComponentPage extends PageObject<CreateComponent<TableRow>> {
  constructor(fixture: ComponentFixture<CreateComponent<TableRow>>) {
    super(fixture);
  }

  get idInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('#id');
  }
  get selectBtn(): HTMLInputElement {
    return this.query<HTMLInputElement>('#select-button');
  }
  get idFreeStatusBox(): HTMLDivElement {
    return this.query<HTMLDivElement>('#id-free-status');
  }
  get sourceInput(): HTMLInputElement {
    return this.getInputById('source-id');
  }
  get copyInput(): HTMLInputElement {
    return this.getInputById('method-copy');
  }
  get copyRadio(): HTMLInputElement | null {
    return this.query<HTMLInputElement>('#method-copy', false);
  }
}

describe('CreateComponent', () => {
  let component: CreateComponent<any>;
  let fixture: ComponentFixture<CreateComponent<any>>;
  let page: CreateComponentPage;

  const fakeQueryService: any = {
    getMaxId: () => of([{ max: 5 }]),
    selectAll: () => of([]),
  };

  const fakeHandlerService: any = {
    select: jasmine.createSpy('select'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, TranslateModule.forRoot(), CreateComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateComponent);
    component = fixture.componentInstance;
    // Provide required inputs
    component.entityTable = 'test';
    component.entityIdField = 'id';
    component.customStartingId = 1;
    component.queryService = fakeQueryService;
    component.handlerService = fakeHandlerService;
    fixture.detectChanges();
    page = new CreateComponentPage(fixture);
  });

  it('does not render the copy option when allowCopy is false', () => {
    // Default allowCopy is false
    fixture.detectChanges();
    const copyRadio = page.copyRadio;
    expect(copyRadio).toBeNull();
    expect(component.creationMethod).toBe('blank');
  });

  it('renders the copy option when allowCopy is true', () => {
    component.allowCopy = true;
    fixture.detectChanges();
    const copyInput = page.copyInput;
    expect(copyInput).toBeDefined();
    // when allowed the copy radio should not be disabled
    expect(copyInput.disabled).toBeFalse();
  });

  it('resets creationMethod to blank when allowCopy is set to false', () => {
    component.allowCopy = true;
    component.creationMethod = 'copy';
    expect(component.creationMethod).toBe('copy');
    component.sourceIdModel = 123;
    component.isSourceIdValid = true;

    component.allowCopy = false;
    // creationMethod should be reset and source-related state cleared
    expect(component.creationMethod).toBe('blank');
    expect(component.sourceIdModel).toBeUndefined();
    expect(component.isSourceIdValid).toBeFalse();
  });
});
// (Additional tests below use the imports declared above)

describe('CreateComponent', () => {
  const mockTable = 'mock_table';
  const mockId = 'mockId';
  const takenId = 100;
  const maxId = 12;
  const MAX_INT_UNSIGNED_VALUE = 4294967295;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BrowserModule, FormsModule, TranslateTestingModule, CreateComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

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

  it('should display the next id by default', async () => {
    const { fixture, page, component } = setup();
    await fixture.whenStable();
    expect(page.idInput.value).toEqual(`${maxId + 1}`);
    expect(component.loading).toBe(false);
  });

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

    (component as any).checkId();
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

  it('validates source id and calls select with copy params on create', async () => {
    const { fixture, page, component } = setup();

    // Enable copying and switch to copy method directly (radio may not always be present in this env)
    component.allowCopy = true;
    component.creationMethod = 'copy';
    fixture.detectChanges();
    await fixture.whenStable();

    const sourceRadio = page.copyRadio;
    // Guard: the radio is optional in this test runner, but the source input must be present for copy flow
    if (sourceRadio) {
      (sourceRadio as HTMLInputElement).checked = true;
      sourceRadio.dispatchEvent(new Event('change'));
      fixture.detectChanges();
    }

    // Provide an existing source id and trigger input (setup returns an existing item for `takenId`)
    const sourceInput = page.sourceInput;
    page.setInputValue(sourceInput, takenId);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isSourceIdValid).toBeTrue();

    // Prepare a new id and create
    component.idModel = 2000;
    component.isIdFree = true;
    fixture.detectChanges();

    const selectSpy = spyOn(component.handlerService, 'select');

    page.clickElement(page.selectBtn);

    expect(selectSpy).toHaveBeenCalledTimes(1);
    expect(selectSpy).toHaveBeenCalledWith(true, 2000, undefined, true, `${takenId}`);
  });

  it('does not allow a higher source value than max value', () => {
    const { component } = setup();
    component.sourceIdModel = MAX_INT_UNSIGNED_VALUE + 1;

    (component as any).checkMaxValue();

    expect(component.sourceIdModel).toEqual(MAX_INT_UNSIGNED_VALUE);
  });

  it('onCreationMethodChange clears source state when switched to blank', () => {
    const { component } = setup();
    component.creationMethod = 'copy';
    component.sourceIdModel = 123;
    component.isSourceIdValid = true;

    component.creationMethod = 'blank';
    (component as any).onCreationMethodChange();

    expect(component.sourceIdModel).toBeUndefined();
    expect(component.isSourceIdValid).toBeFalse();
  });

  it('checkSourceId handles errors and marks source invalid', () => {
    const { component, MockedMysqlQueryService } = setup();
    reset(MockedMysqlQueryService);
    when(MockedMysqlQueryService.selectAll(mockTable, mockId, anything())).thenReturn(throwError('error'));

    component.sourceIdModel = 999;
    (component as any).checkSourceId();

    expect(component.isSourceIdValid).toBeFalse();
    expect(component.loading).toBe(false);
  });

  it('checkSourceId early-return when no sourceIdModel', () => {
    const { component } = setup();
    component.sourceIdModel = undefined;

    (component as any).checkSourceId();

    expect(component.isSourceIdValid).toBeFalse();
  });

  it('isFormValid correctly evaluates copy vs blank methods', () => {
    const { component } = setup();

    // blank creation method
    component.creationMethod = 'blank';
    component.idModel = 1;
    component.isIdFree = true;
    expect((component as any).isFormValid()).toBeTrue();

    // copy method without source data should be invalid
    component.creationMethod = 'copy';
    component.sourceIdModel = undefined;
    component.isSourceIdValid = false;
    expect((component as any).isFormValid()).toBeFalse();

    // copy method with valid source should be valid
    component.sourceIdModel = 123;
    component.isSourceIdValid = true;
    expect((component as any).isFormValid()).toBeTrue();
  });
});
