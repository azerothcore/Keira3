import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { anything, instance, reset, when } from 'ts-mockito';
import { of } from 'rxjs';

import { CreatureTemplateAddonComponent } from './creature-template-addon.component';
import { CommonTestModule } from '../../../../test-utils/common-test.module';
import { MockedMysqlService } from '../../../../test-utils/mocks';
import { MysqlService } from '../../../../services/mysql.service';

describe('CreatureTemplateAddonComponent', () => {
  let component: CreatureTemplateAddonComponent;
  let fixture: ComponentFixture<CreatureTemplateAddonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatureTemplateAddonComponent ],
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

    fixture = TestBed.createComponent(CreatureTemplateAddonComponent);
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
