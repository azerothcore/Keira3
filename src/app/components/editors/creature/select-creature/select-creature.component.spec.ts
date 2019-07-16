import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { QueryService } from '../../../../services/query.service';
import { SelectCreatureComponent } from './select-creature.component';
import { CreatureSelectService } from '../../../../services/select/creature-select.service';
import { SelectCreatureModule } from './select-creature.module';

describe('SelectCreatureComponent', () => {
  let component: SelectCreatureComponent;
  let fixture: ComponentFixture<SelectCreatureComponent>;
  let selectService: CreatureSelectService;
  let queryService: QueryService;
  let querySpy: Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SelectCreatureModule,
        RouterTestingModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    selectService = TestBed.get(CreatureSelectService);
    selectService.query = '--mock query';

    fixture = TestBed.createComponent(SelectCreatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
