import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatureSelectorBtnComponent } from './creature-selector-btn.component';
import { CreatureSelectorModule } from './creature-selector.module';

describe('CreatureSelectorBtnComponent', () => {
  let component: CreatureSelectorBtnComponent;
  let fixture: ComponentFixture<CreatureSelectorBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ CreatureSelectorModule ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatureSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
