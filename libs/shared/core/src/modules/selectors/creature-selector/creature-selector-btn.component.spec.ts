import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreatureSelectorBtnComponent } from './creature-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('CreatureSelectorBtnComponent', () => {
  let component: CreatureSelectorBtnComponent;
  let fixture: ComponentFixture<CreatureSelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), CreatureSelectorBtnComponent],
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
