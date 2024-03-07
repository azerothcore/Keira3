import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SkillSelectorBtnComponent } from './skill-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('SkillSelectorBtnComponent', () => {
  let component: SkillSelectorBtnComponent;
  let fixture: ComponentFixture<SkillSelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), SkillSelectorBtnComponent],
    }).compileComponents();
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
