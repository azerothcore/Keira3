import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { anything, instance, mock, when } from 'ts-mockito';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { GameobjectLootTemplateComponent } from './gameobject-loot-template.component';
import { GameobjectLootTemplateService } from './gameobject-loot-template.service';
import Spy = jasmine.Spy;

describe('GameobjectTemplateComponent', () => {
  let component: GameobjectLootTemplateComponent;
  let fixture: ComponentFixture<GameobjectLootTemplateComponent>;
  let editorService: GameobjectLootTemplateService;
  let getLootIdSpy: Spy;
  let getTypeSpy: Spy;
  let reloadSpy: Spy;
  const MockedMysqlQueryService = mock(MysqlQueryService);

  const lootId = 1230;
  const type = 3;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        GameobjectLootTemplateComponent,
        RouterTestingModule,
        ModalModule.forRoot(),
        TooltipModule.forRoot(),
        ToastrModule.forRoot(),
        TranslateTestingModule,
      ],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    when(MockedMysqlQueryService.query(anything(), anything())).thenReturn(of());
    editorService = TestBed.inject(GameobjectLootTemplateService);
    reloadSpy = spyOn(editorService, 'reload');

    getLootIdSpy = spyOn(editorService, 'getLootId');
    getLootIdSpy.and.returnValue(of([{ lootId }]));

    getTypeSpy = spyOn(editorService, 'getType');
    getTypeSpy.and.returnValue(of([{ type }]));

    fixture = TestBed.createComponent(GameobjectLootTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should correctly initialise', () => {
    expect(getLootIdSpy).toHaveBeenCalledTimes(1);
    expect(getTypeSpy).toHaveBeenCalledTimes(1);
    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });

  it('it should not reload if the lootId is 0', () => {
    getLootIdSpy.calls.reset();
    getTypeSpy.calls.reset();
    reloadSpy.calls.reset();

    getLootIdSpy.and.returnValue(of([{ lootId: 0 }]));
    getTypeSpy.and.returnValue(of([{ lootId: 0 }]));

    component.ngOnInit();

    expect(getLootIdSpy).toHaveBeenCalledTimes(1);
    expect(getTypeSpy).toHaveBeenCalledTimes(1);
    expect(reloadSpy).toHaveBeenCalledTimes(0);
  });

  it('it should not reload if the same entity has already been loaded', () => {
    getLootIdSpy.calls.reset();
    getTypeSpy.calls.reset();
    reloadSpy.calls.reset();
    editorService['_loadedEntityId'] = lootId;

    component.ngOnInit();

    expect(getLootIdSpy).toHaveBeenCalledTimes(1);
    expect(getTypeSpy).toHaveBeenCalledTimes(1);
    expect(reloadSpy).toHaveBeenCalledTimes(0);
  });

  it('should properly handle error', () => {
    const errorSpy = spyOn(console, 'error');
    const error = 'some error';
    getLootIdSpy.and.returnValue(throwError(error));
    getTypeSpy.and.returnValue(throwError(error));

    component.ngOnInit();

    expect(errorSpy).toHaveBeenCalledTimes(2);
    expect(errorSpy).toHaveBeenCalledWith(error);
  });
});
