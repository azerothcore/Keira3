import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
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

describe('GameobjectTemplateComponent', () => {
  const MockedMysqlQueryService = mock(MysqlQueryService);

  const lootId = 1230;
  const type = 3;

  beforeEach(() => {
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
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
      ],
    }).compileComponents();
  });

  function setup() {
    when(MockedMysqlQueryService.query(anything(), anything())).thenReturn(of());
    const editorService = TestBed.inject(GameobjectLootTemplateService);
    const reloadSpy = spyOn(editorService, 'reload');

    const getLootIdSpy = spyOn(editorService, 'getLootId');
    getLootIdSpy.and.returnValue(of([{ lootId }]));

    const getTypeSpy = spyOn(editorService, 'getType');
    getTypeSpy.and.returnValue(of([{ type }]));

    const fixture = TestBed.createComponent(GameobjectLootTemplateComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    return { component, fixture, editorService, reloadSpy, getLootIdSpy, getTypeSpy };
  }

  it('should correctly initialise', () => {
    const { getLootIdSpy, getTypeSpy, reloadSpy } = setup();
    expect(getLootIdSpy).toHaveBeenCalledTimes(1);
    expect(getTypeSpy).toHaveBeenCalledTimes(1);
    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });

  it('it should not reload if the lootId is 0', () => {
    const { component, getLootIdSpy, getTypeSpy, reloadSpy } = setup();
    getLootIdSpy.calls.reset();
    getTypeSpy.calls.reset();
    reloadSpy.calls.reset();

    getLootIdSpy.and.returnValue(of([{ lootId: 0 }]));
    getTypeSpy.and.returnValue(of([{ type: 0 }]));

    component.ngOnInit();

    expect(getLootIdSpy).toHaveBeenCalledTimes(1);
    expect(getTypeSpy).toHaveBeenCalledTimes(1);
    expect(reloadSpy).toHaveBeenCalledTimes(0);
  });

  it('it should not reload if the same entity has already been loaded', () => {
    const { component, editorService, getLootIdSpy, getTypeSpy, reloadSpy } = setup();
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
    const { component, getLootIdSpy, getTypeSpy } = setup();
    const errorSpy = spyOn(console, 'error');
    const error = 'some error';
    getLootIdSpy.and.returnValue(throwError(error));
    getTypeSpy.and.returnValue(throwError(error));

    component.ngOnInit();

    expect(errorSpy).toHaveBeenCalledTimes(2);
    expect(errorSpy).toHaveBeenCalledWith(error);
  });
});
