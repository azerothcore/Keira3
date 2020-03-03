import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { anything, instance, when } from 'ts-mockito';
import { of, throwError } from 'rxjs';
import Spy = jasmine.Spy;

import { TooltipModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { GameobjectLootTemplateComponent } from './gameobject-loot-template.component';
import { GameobjectLootTemplateService } from './gameobject-loot-template.service';
import { GameobjectLootTemplateModule } from './gameobject-loot-template.module';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';

describe('GameobjectTemplateComponent', () => {
  let component: GameobjectLootTemplateComponent;
  let fixture: ComponentFixture<GameobjectLootTemplateComponent>;
  let editorService: GameobjectLootTemplateService;
  let getLootIdSpy: Spy;
  let getTypeSpy: Spy;
  let reloadSpy: Spy;

  const lootId = 1230;
  const type = 3;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        GameobjectLootTemplateModule,
        RouterTestingModule,
        TooltipModule.forRoot(),
        ToastrModule.forRoot(),
      ],
      providers: [
        { provide : MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    when(MockedMysqlQueryService.query(anything(), anything())).thenReturn(of());
    editorService = TestBed.inject(GameobjectLootTemplateService);
    reloadSpy = spyOn(editorService, 'reload');

    getLootIdSpy = spyOn(editorService, 'getLootId');
    getLootIdSpy.and.returnValue(of([ { lootId } ]));

    getTypeSpy = spyOn(editorService, 'getType');
    getTypeSpy.and.returnValue(of([ { type } ]));

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

    getLootIdSpy.and.returnValue(of([ { lootId: 0 } ]));
    getTypeSpy.and.returnValue(of([ { lootId: 0 } ]));

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
