import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GameobjectSelectorBtnComponent } from './gameobject-selector-btn.component';
import { GameobjectSelectorModule } from './gameobject-selector.module';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('GameobjectSelectorBtnComponent', () => {
  let component: GameobjectSelectorBtnComponent;
  let fixture: ComponentFixture<GameobjectSelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), GameobjectSelectorModule],
    }).compileComponents();
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
