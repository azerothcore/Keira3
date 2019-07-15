import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlagsSelectorBtnComponent } from './flags-selector-btn.component';
import { FlagsSelectorModule } from './flags-selector.module';

describe('FlagsSelectorBtnComponent', () => {
  let component: FlagsSelectorBtnComponent;
  let fixture: ComponentFixture<FlagsSelectorBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FlagsSelectorModule ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlagsSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
