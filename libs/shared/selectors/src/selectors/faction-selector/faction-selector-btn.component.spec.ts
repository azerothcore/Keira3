import { TestBed, waitForAsync } from '@angular/core/testing';

import { FactionSelectorBtnComponent } from './faction-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('FactionSelectorBtnComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), FactionSelectorBtnComponent],
    }).compileComponents();
  }));

  function setup() {
    const fixture = TestBed.createComponent(FactionSelectorBtnComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
