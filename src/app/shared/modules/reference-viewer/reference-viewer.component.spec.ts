import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferenceViewerComponent } from './reference-viewer.component';

describe('ReferenceViewerComponent', () => {
  let component: ReferenceViewerComponent;
  let fixture: ComponentFixture<ReferenceViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReferenceViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
