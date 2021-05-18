import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FlagsSelectorBtnComponent } from './flags-selector-btn.component';
import { FlagsSelectorModule } from './flags-selector.module';

describe('FlagsSelectorBtnComponent', () => {
  let component: FlagsSelectorBtnComponent;
  let fixture: ComponentFixture<FlagsSelectorBtnComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [FlagsSelectorModule],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(FlagsSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
