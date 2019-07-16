import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { QueryService } from '../../../../services/query.service';
import { CreatureQuestitemComponent } from './creature-questitem.component';
import { CreatureQuestitemModule } from './creature-questitem.module';

describe('CreatureQuestitemComponent', () => {
  let component: CreatureQuestitemComponent;
  let fixture: ComponentFixture<CreatureQuestitemComponent>;
  let queryService: QueryService;
  let querySpy: Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CreatureQuestitemModule,
        RouterTestingModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    fixture = TestBed.createComponent(CreatureQuestitemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
