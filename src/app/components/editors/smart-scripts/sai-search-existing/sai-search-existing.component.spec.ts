import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaiSearchExistingComponent } from './sai-search-existing.component';

describe('SaiSearchExistingComponent', () => {
  let component: SaiSearchExistingComponent;
  let fixture: ComponentFixture<SaiSearchExistingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaiSearchExistingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaiSearchExistingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
