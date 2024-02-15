import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreatureSelectorBtnComponent } from './creature-selector-btn.component';
import { CreatureSelectorModule } from './creature-selector.module';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('CreatureSelectorBtnComponent', () => {
  let component: CreatureSelectorBtnComponent;
  let fixture: ComponentFixture<CreatureSelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), CreatureSelectorModule],
    }).compileComponents();
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
