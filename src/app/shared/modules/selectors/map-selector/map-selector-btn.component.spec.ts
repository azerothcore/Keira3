import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MapSelectorBtnComponent } from './map-selector-btn.component';
import { MapSelectorModule } from './map-selector.module';

describe('MapSelectorBtnComponent', () => {
  let component: MapSelectorBtnComponent;
  let fixture: ComponentFixture<MapSelectorBtnComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [MapSelectorModule],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(MapSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
