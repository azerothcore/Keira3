import { Component, viewChild, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { EditorButtonsComponent } from './editor-buttons.component';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { TableRow } from '@keira/shared/constants';

@Component({
  template: `<keira-editor-buttons
    [selectedRowId]="editorService.selectedRowId"
    (deleteSelectedRow)="editorService.deleteSelectedRow()"
    (addNewRow)="editorService.addNewRow()"
    (duplicateRow)="editorService.addNewRow(true)"
  />`,
  imports: [TranslateTestingModule, EditorButtonsComponent],
})
class TestHostComponent {
  readonly child = viewChild.required(EditorButtonsComponent);
  editorService!: MultiRowEditorService<TableRow>;
}

class EditorButtonsPage extends PageObject<TestHostComponent> {
  get addBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#add-new-row-btn');
  }
  get deleteBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#delete-selected-row-btn');
  }
  get duplicateBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#duplicate-selected-row-btn');
  }
}

describe('EditorButtonsComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateTestingModule, EditorButtonsComponent, TestHostComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

  const setup = () => {
    const editorService = {
      selectedRowId: 0, // intentionally set to 0, a falsy non-null value
      deleteSelectedRow: jasmine.createSpy('deleteSelectedRow'),
      addNewRow: jasmine.createSpy('addNewRow'),
    };
    const fixture = TestBed.createComponent(TestHostComponent);
    const page = new EditorButtonsPage(fixture);
    const host = fixture.componentInstance;
    host.editorService = editorService as unknown as MultiRowEditorService<TableRow>;

    return { fixture, host, editorService, page };
  };

  describe('the delete button', () => {
    it('should be disabled when the selected row is undefined', () => {
      const { editorService, page, fixture } = setup();
      editorService.selectedRowId = undefined as any;
      fixture.detectChanges();
      expect(page.deleteBtn.disabled).toBe(true);
    });

    it('should be enabled when there is a selected row', () => {
      const { editorService, page, fixture } = setup();
      editorService.selectedRowId = 123;
      fixture.detectChanges();
      expect(page.deleteBtn.disabled).toBe(false);
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
      expect(editorService.addNewRow).toHaveBeenCalledOnceWith();
      expect(editorService.deleteSelectedRow).toHaveBeenCalledTimes(0);
    });
  });

  describe('the duplicate button', () => {
    it('should be disabled when the selected row is undefiend', () => {
      const { editorService, page, fixture } = setup();
      editorService.selectedRowId = undefined as any;
      fixture.detectChanges();
      expect(page.duplicateBtn.disabled).toBe(true);
    });

    it('should be enabled when there is a selected row', () => {
      const { editorService, page, fixture } = setup();
      editorService.selectedRowId = 123;
      fixture.detectChanges();
      expect(page.duplicateBtn.disabled).toBe(false);
    });

    it('when clicked, should call editorService.addNewRow(true)', () => {
      const { editorService, page } = setup();
      page.clickElement(page.duplicateBtn);
      expect(editorService.addNewRow).toHaveBeenCalledOnceWith(true);
      expect(editorService.deleteSelectedRow).toHaveBeenCalledTimes(0);
    });
  });
});
