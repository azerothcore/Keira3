import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NpcTextSelectorBtnComponent } from './npc-text-selector-btn.component';
import { NpcTextSelectorModule } from './npc-text-selector.module';

describe('NpcTextSelectorBtnComponent', () => {
  let component: NpcTextSelectorBtnComponent;
  let fixture: ComponentFixture<NpcTextSelectorBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ NpcTextSelectorModule ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NpcTextSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
