import { TestBed, waitForAsync } from '@angular/core/testing';

import { NpcTextSelectorBtnComponent } from './npc-text-selector-btn.component';
import { NpcTextSelectorModule } from './npc-text-selector.module';

describe('NpcTextSelectorBtnComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ NpcTextSelectorModule ],
    })
    .compileComponents();
  }));

  function setup() {
    const fixture = TestBed.createComponent(NpcTextSelectorBtnComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    return { component, fixture };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
