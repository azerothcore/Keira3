import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { anything, instance, when } from 'ts-mockito';

import { CreatureLootTemplateComponent } from './creature-loot-template.component';
import { CommonTestModule } from '../../../../test-utils/common-test.module';
import { MysqlService } from '../../../../services/mysql.service';
import { MockedMysqlService } from '../../../../test-utils/mocks';
import { of } from 'rxjs';
import { CommonEditorTestModule } from '../../../../test-utils/common-editor-test-module';

describe('CreatureLootTemplateComponent', () => {
  let component: CreatureLootTemplateComponent;
  let fixture: ComponentFixture<CreatureLootTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CreatureLootTemplateComponent,
      ],
      imports: [
        CommonTestModule,
        CommonEditorTestModule,
      ],
      providers: [
        { provide : MysqlService, useValue: instance(MockedMysqlService) },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    when(MockedMysqlService.query(anything(), anything())).thenReturn(of());

    fixture = TestBed.createComponent(CreatureLootTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
