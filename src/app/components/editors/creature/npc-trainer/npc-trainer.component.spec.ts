import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { anything, instance, when } from 'ts-mockito';
import { of } from 'rxjs';

import { NpcTrainerComponent } from './npc-trainer.component';
import { MysqlService } from '../../../../services/mysql.service';
import { MockedMysqlService } from '../../../../test-utils/mocks';
import { NpcTrainerModule } from './npc-trainer.module';


describe('NpcTrainerComponent', () => {
  let component: NpcTrainerComponent;
  let fixture: ComponentFixture<NpcTrainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NpcTrainerModule,
        RouterTestingModule
      ],
      providers: [
        { provide : MysqlService, useValue: instance(MockedMysqlService) },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    when(MockedMysqlService.query(anything(), anything())).thenReturn(of());

    fixture = TestBed.createComponent(NpcTrainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
