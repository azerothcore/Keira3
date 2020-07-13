import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpellSelectorBtnComponent } from './spell-selector-btn.component';
import { SpellSelectorModule } from './spell-selector.module';

describe('SpellSelectorBtnComponent', () => {
  let component: SpellSelectorBtnComponent;
  let fixture: ComponentFixture<SpellSelectorBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SpellSelectorModule],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpellSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
