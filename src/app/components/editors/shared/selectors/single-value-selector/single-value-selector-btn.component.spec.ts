import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalModule } from 'ngx-bootstrap';

import { SingleValueSelectorBtnComponent } from './single-value-selector-btn.component';

describe('SingleValueSelectorBtnComponent', () => {
  let component: SingleValueSelectorBtnComponent;
  let fixture: ComponentFixture<SingleValueSelectorBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleValueSelectorBtnComponent ],
      imports: [
        ModalModule.forRoot(),
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleValueSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
