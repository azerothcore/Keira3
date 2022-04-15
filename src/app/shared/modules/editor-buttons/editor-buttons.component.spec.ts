import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { PageObject } from '@keira-testing/page-object';
import { EditorButtonsComponent } from './editor-buttons.component';

@Component({
  template: `<keira-editor-buttons [editorService]="editorService"></keira-editor-buttons>`,
})
class TestHostComponent {
  @ViewChild(EditorButtonsComponent) child: EditorButtonsComponent<null>;
  editorService;
}

class EditorButtonsPage extends PageObject<TestHostComponent> {
  get addBtn() {
    return this.query<HTMLButtonElement>('#add-new-row-btn');
  }
  get deleteBtn() {
    return this.query<HTMLButtonElement>('#delete-selected-row-btn');
  }
}

describe('EditorButtonsComponent', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [EditorButtonsComponent, TestHostComponent],
      }).compileComponents();
    }),
  );

  const setup = () => {
    const editorService = {
      selectedRowId: 0, // intentionally set to 0, a falsy non-null value
      deleteSelectedRow: jasmine.createSpy('deleteSelectedRow'),
      addNewRow: jasmine.createSpy('addNewRow'),
    };
    const fixture = TestBed.createComponent(TestHostComponent);
    const page = new EditorButtonsPage(fixture);
    const host = fixture.componentInstance;
    host.editorService = editorService;
    fixture.detectChanges();
    const component = host.child;
    return { fixture, host, component, editorService, page };
  };

  describe('the delete button', () => {
    it('should be enabled only when there is a selected row', () => {
      const { editorService, page, fixture } = setup();
      editorService.selectedRowId = null;
      fixture.detectChanges();
      expect(page.deleteBtn.disabled).toBe(true);

      editorService.selectedRowId = 123;
      fixture.detectChanges();
      expect(page.deleteBtn.disabled).toBe(false);

      editorService.selectedRowId = null;
      fixture.detectChanges();
      expect(page.deleteBtn.disabled).toBe(true);
    });

    it('when clicked, should call editorService.deleteSelectedRow()', () => {
      const { editorService, page } = setup();
      page.clickElement(page.deleteBtn);
      expect(editorService.deleteSelectedRow).toHaveBeenCalledTimes(1);
      expect(editorService.addNewRow).toHaveBeenCalledTimes(0);
    });
  });

  describe('the add button', () => {
    it('when clicked, should call editorService.addNewRow()', () => {
      const { editorService, page } = setup();
      page.clickElement(page.addBtn);
      expect(editorService.addNewRow).toHaveBeenCalledTimes(1);
      expect(editorService.deleteSelectedRow).toHaveBeenCalledTimes(0);
    });
  });
});
