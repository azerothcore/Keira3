import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { QueryService } from '../../../../services/query.service';
import { GameobjectTemplateComponent } from './gameobject-template.component';
import { GameobjectTemplateModule } from './gameobject-template.module';
import { RouterTestingModule } from '@angular/router/testing';
import { GameobjectTemplateService } from '../../../../services/editors/gameobject/gameobject-template.service';
import { FieldDefinition } from '../../../../types/general';

describe('GameobjectComponent', () => {
  let component: GameobjectTemplateComponent;
  let fixture: ComponentFixture<GameobjectTemplateComponent>;
  let queryService: QueryService;
  let querySpy: Spy;
  let gameobjectTemplateService: GameobjectTemplateService;
  let getFieldSpy: Spy;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        GameobjectTemplateModule,
        RouterTestingModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    fixture = TestBed.createComponent(GameobjectTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should check the Data* field name on change the field "type"', () => {
    const mockValue: FieldDefinition = { name: 'Mock Value', tooltip: null };
    const mockType = 'mockTypeValue';
    const index = 3;
    gameobjectTemplateService = TestBed.get(GameobjectTemplateService);
    gameobjectTemplateService.form.get('type').setValue(mockType);
    getFieldSpy = spyOn(gameobjectTemplateService, 'getFieldDefinition').and.returnValue(mockValue);

    expect(component.dataFieldDefinition(index)).toEqual(mockValue);
    expect(getFieldSpy).toHaveBeenCalledTimes(1);
    expect(getFieldSpy).toHaveBeenCalledWith(mockType, index);
  });
});
