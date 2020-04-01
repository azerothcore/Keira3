import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorButtonsComponent } from './editor-buttons.component';

describe('EditorButtonsComponent', () => {
  let component: EditorButtonsComponent<any>;
  let fixture: ComponentFixture<EditorButtonsComponent<any>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditorButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
