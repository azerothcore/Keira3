import { async, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';

import { EditorButtonsComponent } from './editor-buttons.component';


@Component({
  template: `<keira-editor-buttons [editorService]="editorService"></keira-editor-buttons>`
})
class TestHostComponent {
  @ViewChild(EditorButtonsComponent) child: EditorButtonsComponent<null>;
  editorService;
}

describe('EditorButtonsComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditorButtonsComponent, TestHostComponent ]
    })
    .compileComponents();
  }));

  const setup = () => {
    const editorService = {
      selectedRowId: false,
      deleteSelectedRow: jasmine.createSpy('deleteSelectedRow'),
      addNewRow: jasmine.createSpy('addNewRow'),
    };
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    host.editorService = editorService;
    fixture.detectChanges();
    const component = host.child;
    return { fixture, host, component, editorService };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
