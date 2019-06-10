import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CreatureEquipTemplateComponent } from './creature-equip-template.component';
import { CommonTestModule } from '../../../../test-utils/common-test.module';

describe('CreatureEquipTemplateComponent', () => {
  let component: CreatureEquipTemplateComponent;
  let fixture: ComponentFixture<CreatureEquipTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatureEquipTemplateComponent ],
      imports: [
        CommonTestModule,
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatureEquipTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
