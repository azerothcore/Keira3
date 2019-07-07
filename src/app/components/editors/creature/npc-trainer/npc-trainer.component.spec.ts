import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { anything, instance, when } from 'ts-mockito';
import { of } from 'rxjs';

import { NpcTrainerComponent } from './npc-trainer.component';
import { CommonTestModule } from '../../../../test-utils/common-test.module';
import { MysqlService } from '../../../../services/mysql.service';
import { MockedMysqlService } from '../../../../test-utils/mocks';
import { CommonEditorTestModule } from '../../../../test-utils/common-editor-test-module';

describe('NpcTrainerComponent', () => {
  let component: NpcTrainerComponent;
  let fixture: ComponentFixture<NpcTrainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        NpcTrainerComponent,
      ],
      imports: [
        CommonTestModule,
        CommonEditorTestModule,
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
