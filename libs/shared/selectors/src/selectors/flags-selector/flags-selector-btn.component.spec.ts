import { TestBed, waitForAsync } from '@angular/core/testing';
import { FlagsSelectorBtnComponent } from './flags-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('FlagsSelectorBtnComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), FlagsSelectorBtnComponent],
    }).compileComponents();
  }));

  function setup() {
    const fixture = TestBed.createComponent(FlagsSelectorBtnComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
