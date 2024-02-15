import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SpellSelectorBtnComponent } from './spell-selector-btn.component';
import { SpellSelectorModule } from './spell-selector.module';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('SpellSelectorBtnComponent', () => {
  let component: SpellSelectorBtnComponent;
  let fixture: ComponentFixture<SpellSelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), SpellSelectorModule],
    }).compileComponents();
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
