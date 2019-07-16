import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { QueryService } from '../../../../services/query.service';
import { NpcTrainerComponent } from './npc-trainer.component';
import { NpcTrainerModule } from './npc-trainer.module';


describe('NpcTrainerComponent', () => {
  let component: NpcTrainerComponent;
  let fixture: ComponentFixture<NpcTrainerComponent>;
  let queryService: QueryService;
  let querySpy: Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NpcTrainerModule,
        RouterTestingModule
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    fixture = TestBed.createComponent(NpcTrainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
