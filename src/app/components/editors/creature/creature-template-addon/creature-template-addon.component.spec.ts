import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { anything, instance, reset, when } from 'ts-mockito';
import { of } from 'rxjs';

import { CreatureTemplateAddonComponent } from './creature-template-addon.component';
import { CommonTestModule } from '../../../../test-utils/common-test.module';
import { MockedMysqlService } from '../../../../test-utils/mocks';
import { MysqlService } from '../../../../services/mysql.service';
import { CommonEditorTestModule } from '../../../../test-utils/common-editor-test-module';

describe('CreatureTemplateAddonComponent', () => {
  let component: CreatureTemplateAddonComponent;
  let fixture: ComponentFixture<CreatureTemplateAddonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatureTemplateAddonComponent ],
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
