import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FactionSelectorBtnComponent } from './faction-selector-btn.component';
import { FactionSelectorModule } from './faction-selector.module';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('FactionSelectorBtnComponent', () => {
  let component: FactionSelectorBtnComponent;
  let fixture: ComponentFixture<FactionSelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), FactionSelectorModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactionSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
