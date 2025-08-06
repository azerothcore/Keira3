import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { MapSelectorBtnComponent } from './map-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('MapSelectorBtnComponent', () => {
  let component: MapSelectorBtnComponent;
  let fixture: ComponentFixture<MapSelectorBtnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), MapSelectorBtnComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
