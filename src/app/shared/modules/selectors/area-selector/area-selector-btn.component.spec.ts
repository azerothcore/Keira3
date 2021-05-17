import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AreaSelectorBtnComponent } from './area-selector-btn.component';
import { AreaSelectorModule } from './area-selector.module';

describe('AreaSelectorBtnComponent', () => {
  let component: AreaSelectorBtnComponent;
  let fixture: ComponentFixture<AreaSelectorBtnComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [AreaSelectorModule],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AreaSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
