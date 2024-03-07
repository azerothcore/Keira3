import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MapSelectorBtnComponent } from './map-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('MapSelectorBtnComponent', () => {
  let component: MapSelectorBtnComponent;
  let fixture: ComponentFixture<MapSelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), MapSelectorBtnComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
