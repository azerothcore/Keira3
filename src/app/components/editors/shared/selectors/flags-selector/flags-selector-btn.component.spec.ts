import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalModule } from 'ngx-bootstrap';

import { FlagsSelectorBtnComponent } from './flags-selector-btn.component';

describe('FlagsSelectorBtnComponent', () => {
  let component: FlagsSelectorBtnComponent;
  let fixture: ComponentFixture<FlagsSelectorBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlagsSelectorBtnComponent ],
      imports: [
        ModalModule.forRoot(),
      ]
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
