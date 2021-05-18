import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { GameobjectTemplateComponent } from './gameobject-template.component';
import { GameobjectTemplateModule } from './gameobject-template.module';
import { RouterTestingModule } from '@angular/router/testing';
import { GameobjectTemplateService } from './gameobject-template.service';
import { FieldDefinition } from '@keira-types/general';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';

describe('GameobjectComponent', () => {
  let component: GameobjectTemplateComponent;
  let fixture: ComponentFixture<GameobjectTemplateComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let gameobjectTemplateService: GameobjectTemplateService;
  let getFieldSpy: Spy;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [GameobjectTemplateModule, RouterTestingModule],
        providers: [GameobjectHandlerService, SaiGameobjectHandlerService],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    fixture = TestBed.createComponent(GameobjectTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should check the Data* field name on change the field "type"', () => {
    const mockValue: FieldDefinition = { name: 'Mock Value', tooltip: null };
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
