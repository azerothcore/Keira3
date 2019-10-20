import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaiSearchEntityComponent } from './sai-search-entity.component';

describe('SaiSearchEntityComponent', () => {
  let component: SaiSearchEntityComponent;
  let fixture: ComponentFixture<SaiSearchEntityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaiSearchEntityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaiSearchEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
