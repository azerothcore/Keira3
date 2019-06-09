import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NpcVendorComponent } from './npc-vendor.component';

describe('NpcVendorComponent', () => {
  let component: NpcVendorComponent;
  let fixture: ComponentFixture<NpcVendorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NpcVendorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NpcVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
