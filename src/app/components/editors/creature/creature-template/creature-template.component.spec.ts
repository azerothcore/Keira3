import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CreatureTemplateComponent } from './creature-template.component';
import { TopBarComponent } from '../../../main-window/top-bar/top-bar.component';
import { QueryOutputComponent } from '../../query-output/query-output.component';
import { CommonTestModule } from '../../../../test-utils/common-test.module';

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
      schemas: [ NO_ERRORS_SCHEMA ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatureTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
