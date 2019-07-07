import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { anything, instance, reset, when } from 'ts-mockito';
import { of } from 'rxjs';

import { CreatureOnkillReputationComponent } from './creature-onkill-reputation.component';
import { CommonTestModule } from '../../../../test-utils/common-test.module';
import { MockedMysqlService } from '../../../../test-utils/mocks';
import { MysqlService } from '../../../../services/mysql.service';
import { CommonEditorTestModule } from '../../../../test-utils/common-editor-test-module';

describe('CreatureOnkillReputationComponent', () => {
  let component: CreatureOnkillReputationComponent;
  let fixture: ComponentFixture<CreatureOnkillReputationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatureOnkillReputationComponent ],
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

    fixture = TestBed.createComponent(CreatureOnkillReputationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterEach(() => {
    reset(MockedMysqlService);
  });
});
