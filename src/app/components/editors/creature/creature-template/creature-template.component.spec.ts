import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { anything, instance, reset, when } from 'ts-mockito';

import { CreatureTemplateComponent } from './creature-template.component';
import { TopBarComponent } from '../../../main-window/top-bar/top-bar.component';
import { QueryOutputComponent } from '../../shared/query-output/query-output.component';
import { CommonTestModule } from '../../../../test-utils/common-test.module';
import { MockedMysqlService } from '../../../../test-utils/mocks';
import { MysqlService } from '../../../../services/mysql.service';
import { of } from 'rxjs';

describe('CreatureTemplateComponent', () => {
  let component: CreatureTemplateComponent;
  let fixture: ComponentFixture<CreatureTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CreatureTemplateComponent,
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

    fixture = TestBed.createComponent(CreatureTemplateComponent);
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
