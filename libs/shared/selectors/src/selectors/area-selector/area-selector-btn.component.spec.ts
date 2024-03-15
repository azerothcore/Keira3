import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AreaSelectorBtnComponent } from './area-selector-btn.component';

describe('AreaSelectorBtnComponent', () => {
  let component: AreaSelectorBtnComponent;
  let fixture: ComponentFixture<AreaSelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), AreaSelectorBtnComponent],
    }).compileComponents();
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
