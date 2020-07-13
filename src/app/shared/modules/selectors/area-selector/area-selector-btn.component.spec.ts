import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaSelectorBtnComponent } from './area-selector-btn.component';
import { AreaSelectorModule } from './area-selector.module';

describe('AreaSelectorBtnComponent', () => {
  let component: AreaSelectorBtnComponent;
  let fixture: ComponentFixture<AreaSelectorBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AreaSelectorModule],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AreaSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
