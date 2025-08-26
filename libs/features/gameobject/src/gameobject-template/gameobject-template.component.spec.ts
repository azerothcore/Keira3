import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { FieldDefinition } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { Model3DViewerComponent } from '@keira/shared/model-3d-viewer';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { MockComponent } from 'ng-mocks';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { GameobjectTemplateComponent } from './gameobject-template.component';
import { GameobjectTemplateService } from './gameobject-template.service';
import Spy = jasmine.Spy;

describe('GameobjectComponent', () => {
  let component: GameobjectTemplateComponent;
  let fixture: ComponentFixture<GameobjectTemplateComponent>;
  let queryService: MysqlQueryService;
  let gameobjectTemplateService: GameobjectTemplateService;
  let getFieldSpy: Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), ToastrModule.forRoot(), GameobjectTemplateComponent, RouterTestingModule, TranslateTestingModule],
      declarations: [MockComponent(Model3DViewerComponent)],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), GameobjectHandlerService, SaiGameobjectHandlerService],
    }).compileComponents();
  });

  beforeEach(() => {
    queryService = TestBed.inject(MysqlQueryService);
    spyOn(queryService, 'query').and.returnValue(of());

    fixture = TestBed.createComponent(GameobjectTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should check the Data* field name on change the field "type"', () => {
    const mockValue: FieldDefinition = { name: 'Mock Value', tooltip: null as any };
    const mockType = 123;
    const index = 3;
    gameobjectTemplateService = TestBed.inject(GameobjectTemplateService);
    gameobjectTemplateService.form.controls.type.setValue(mockType);
    getFieldSpy = spyOn(gameobjectTemplateService, 'getFieldDefinition').and.returnValue(mockValue);

    expect(component.dataFieldDefinition(index)).toEqual(mockValue);
    expect(getFieldSpy).toHaveBeenCalledTimes(1);
    expect(getFieldSpy).toHaveBeenCalledWith(mockType, index);
  });
});
