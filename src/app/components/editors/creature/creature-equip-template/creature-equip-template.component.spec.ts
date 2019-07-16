import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { CreatureEquipTemplateComponent } from './creature-equip-template.component';
import { CreatureEquipTemplateModule } from './creature-equip-template.module';
import { QueryService } from '../../../../services/query.service';

describe('CreatureEquipTemplateComponent', () => {
  let component: CreatureEquipTemplateComponent;
  let fixture: ComponentFixture<CreatureEquipTemplateComponent>;
  let queryService: QueryService;
  let querySpy: Spy;

  const entityId = 123456789;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CreatureEquipTemplateModule,
        RouterTestingModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    fixture = TestBed.createComponent(CreatureEquipTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
