import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { FieldDefinition } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { Model3DViewerService } from '@keira/shared/model-3d-viewer';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { GameobjectTemplateComponent } from './gameobject-template.component';
import { GameobjectTemplateService } from './gameobject-template.service';

describe('GameobjectComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), ToastrModule.forRoot(), GameobjectTemplateComponent, RouterTestingModule, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), GameobjectHandlerService, SaiGameobjectHandlerService],
    }).compileComponents();
  });

  function setup() {
    const queryService = TestBed.inject(MysqlQueryService);
    spyOn(queryService, 'query').and.returnValue(of());

    const model3DViewerService = TestBed.inject(Model3DViewerService);
    spyOn(model3DViewerService, 'generateModels').and.returnValue(new Promise((resolve) => resolve({ destroy: () => {} })));

    const fixture = TestBed.createComponent(GameobjectTemplateComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    return { component, fixture, queryService, model3DViewerService };
  }

  it('should check the Data* field name on change the field "type"', () => {
    const { component } = setup();
    const mockValue: FieldDefinition = { name: 'Mock Value', tooltip: null as any };
    const mockType = 123;
    const index = 3;
    const gameobjectTemplateService = TestBed.inject(GameobjectTemplateService);
    gameobjectTemplateService.form.controls.type.setValue(mockType);
    const getFieldSpy = spyOn(gameobjectTemplateService, 'getFieldDefinition').and.returnValue(mockValue);

    expect(component.dataFieldDefinition(index)).toEqual(mockValue);
    expect(getFieldSpy).toHaveBeenCalledTimes(1);
    expect(getFieldSpy).toHaveBeenCalledWith(mockType, index);
  });
});
