import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { anything, instance, when } from 'ts-mockito';

import { CreatureQuestitemComponent } from './creature-questitem.component';
import { QueryOutputComponent } from '../../shared/query-output/query-output.component';
import { TopBarComponent } from '../../../main-window/top-bar/top-bar.component';
import { CommonTestModule } from '../../../../test-utils/common-test.module';
import { MysqlService } from '../../../../services/mysql.service';
import { MockedMysqlService } from '../../../../test-utils/mocks';
import { of } from 'rxjs';

describe('CreatureQuestitemComponent', () => {
  let component: CreatureQuestitemComponent;
  let fixture: ComponentFixture<CreatureQuestitemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CreatureQuestitemComponent,
        QueryOutputComponent,
        TopBarComponent,
      ],
      imports: [
        CommonTestModule,
      ],
      providers: [
        { provide : MysqlService, useValue: instance(MockedMysqlService) },
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    when(MockedMysqlService.query(anything(), anything())).thenReturn(of());

    fixture = TestBed.createComponent(CreatureQuestitemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
