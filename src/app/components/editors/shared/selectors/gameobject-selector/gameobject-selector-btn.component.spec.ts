import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameobjectSelectorBtnComponent } from './gameobject-selector-btn.component';
import { GameobjectSelectorModule } from './gameobject-selector.module';

describe('GameobjectSelectorBtnComponent', () => {
  let component: GameobjectSelectorBtnComponent;
  let fixture: ComponentFixture<GameobjectSelectorBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ GameobjectSelectorModule ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameobjectSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
