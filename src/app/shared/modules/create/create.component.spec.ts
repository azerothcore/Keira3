import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { anything, instance, mock, reset, when } from 'ts-mockito';
import { of, throwError } from 'rxjs';

import { CreateComponent } from './create.component';
import { MockedMysqlQueryService, MockType } from '../../testing/mocks';
import { PageObject } from '../../testing/page-object';
import Spy = jasmine.Spy;
import { CreatureHandlerService } from '../../../features/creature/creature-handler.service';

class CreateComponentPage extends PageObject<CreateComponent<MockType>> {
  get idInput() { return this.query<HTMLInputElement>('#id'); }
  get selectBtn() { return this.query<HTMLInputElement>('#select-button'); }
  get idFreeStatusBox() { return this.query<HTMLDivElement>('#id-free-status'); }
}

describe('CreateComponent', () => {
  let component: CreateComponent<MockType>;
  let fixture: ComponentFixture<CreateComponent<MockType>>;
  let page: CreateComponentPage;
  let spyError: Spy;

  const mockTable = 'mock_table';
  const mockId = 'mockId';
  const takenId = 100;
  const maxId = 12;

  beforeEach(async(() => {
    spyError = spyOn(console, 'error');

    TestBed.configureTestingModule({
      declarations: [
        CreateComponent,
      ],
      imports: [
        BrowserModule,
        FormsModule,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    when(MockedMysqlQueryService.getMaxId(mockTable, mockId)).thenReturn(of([{ max: maxId }]));
    when(MockedMysqlQueryService.selectAll(mockTable, mockId, anything())).thenReturn(of([]));
    when(MockedMysqlQueryService.selectAll(mockTable, mockId, takenId)).thenReturn(of([{}]));

    fixture = TestBed.createComponent(CreateComponent);
    component = fixture.componentInstance;
    component.entityTable = mockTable;
    component.entityIdField = mockId;
    component.handlerService = instance(mock(CreatureHandlerService));
    component.queryService = instance(MockedMysqlQueryService);
    page = new CreateComponentPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  });

  it('should display the next id by default', () => {
    fixture.whenStable().then(() => {
      expect(page.idInput.value).toEqual(`${maxId + 1}`);
      expect(component.loading).toBe(false);
    });
  });

  it('should correctly toggle id free status the message', () => {
    page.setInputValue(page.idInput, takenId);
    expect(page.idFreeStatusBox.innerHTML).toContain('already in use');

    page.setInputValue(page.idInput, takenId + 1);
    expect(page.idFreeStatusBox.innerHTML).toContain('free');

    expect(component.loading).toBe(false);
  });

  it('should correctly show console errors if any', () => {
    reset(MockedMysqlQueryService);
    when(MockedMysqlQueryService.getMaxId(mockTable, mockId)).thenReturn(throwError('error'));
    when(MockedMysqlQueryService.selectAll(mockTable, mockId, anything())).thenReturn(throwError('error'));

    component.checkId();
    component['getNextId']();

    expect(spyError).toHaveBeenCalledTimes(2);
    expect(component.loading).toBe(false);
  });

  it('if queryService param is not passed, should not call getNextId', () => {
    const spyGetNextId = spyOn<any>(component, 'getNextId');
    component.queryService = null;

    component.ngOnInit();

    expect(spyGetNextId).toHaveBeenCalledTimes(0);
  });

  it('clicking the button should correctly trigger the selection', () => {
    const selectSpy = spyOn(component.handlerService, 'select');
    const id = 1234;
    page.setInputValue(page.idInput, id);

    page.clickElement(page.selectBtn);

    expect(selectSpy).toHaveBeenCalledTimes(1);
    expect(selectSpy).toHaveBeenCalledWith(true, id);
  });

  it('the customStartId should be preferred when greater than the currentMax', () => {
    component.customStartingId = 10;
    expect(component['calculateNextId'](5)).toEqual(10);
  });

  afterEach(() => {
    reset(MockedMysqlQueryService);
  });
});
