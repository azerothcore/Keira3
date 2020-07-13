import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillSelectorBtnComponent } from './skill-selector-btn.component';
import { SkillSelectorModule } from './skill-selector.module';

describe('SkillSelectorBtnComponent', () => {
  let component: SkillSelectorBtnComponent;
  let fixture: ComponentFixture<SkillSelectorBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SkillSelectorModule],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
