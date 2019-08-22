import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { anything, instance, when } from 'ts-mockito';
import { of, throwError } from 'rxjs';
import Spy = jasmine.Spy;

import { TooltipModule } from 'ngx-bootstrap';
import { QueryService } from '../../../../services/query.service';
import { MockedQueryService } from '../../../../test-utils/mocks';
import { GameobjectLootTemplateComponent } from '../../gameobject/gameobject-loot-template/gameobject-loot-template.component';
import { GameobjectLootTemplateService } from '../../../../services/editors/gameobject/gameobject-loot-template.service';
import { GameobjectLootTemplateModule } from '../../gameobject/gameobject-loot-template/gameobject-loot-template.module';

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
      ],
      providers: [
        { provide : QueryService, useValue: instance(MockedQueryService) },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    when(MockedQueryService.query(anything(), anything())).thenReturn(of());
    editorService = TestBed.get(GameobjectLootTemplateService);
    reloadSpy = spyOn(editorService, 'reload');

    getLootIdSpy = spyOn(editorService, 'getLootId');
    getLootIdSpy.and.returnValue(of({ results: [ { lootId } ]}));

    getTypeSpy = spyOn(editorService, 'getType');
    getTypeSpy.and.returnValue(of({ results: [ { type } ]}));

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

    getLootIdSpy.and.returnValue(of({ results: [ { lootId: 0 } ]}));
    getTypeSpy.and.returnValue(of({ results: [ { lootId: 0 } ]}));

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
