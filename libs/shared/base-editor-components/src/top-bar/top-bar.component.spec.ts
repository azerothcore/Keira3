import { vi } from 'vitest';
import { Component, viewChild, provideZonelessChangeDetection } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { TableRow } from '@keira/shared/constants';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { TopBarComponent } from './top-bar.component';

describe(TopBarComponent.name, () => {
  @Component({
    template: `
      <keira-top-bar
        [selected]="selected"
        [selectedName]="selectedName"
        [isNew]="isNew"
        [customScssClass]="customScssClass"
        [handler]="handler"
      />
    `,
    imports: [TopBarComponent],
  })
  class TestHostComponent {
    readonly child = viewChild.required(TopBarComponent);
    selected: string | undefined;
    selectedName: string | undefined;
    isNew: boolean = false;
    customScssClass: string | undefined;
    handler: HandlerService<TableRow> | undefined;
  }

  class Page extends PageObject<TestHostComponent> {
    mainWrapper() {
      return this.getDebugElementByCss('.top-bar');
    }

    exportButton(assert = true) {
      return this.getDebugElementByCss('#export-entity-btn', assert);
    }

    mainText(assert = true) {
      return this.getDebugElementByCss('.top-bar .main-text', assert);
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TopBarComponent, TestHostComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const page = new Page(fixture);
    return { host, page };
  };

  describe('when there is no selected value', () => {
    it('should only show the main wrapper', () => {
      const { host, page } = setup();

      host.selected = undefined;
      page.detectChanges();

      expect(page.mainWrapper()).toBeTruthy();
      expect(page.mainText(false)).toBeFalsy();
    });
  });

  describe('when there is a custom scss class', () => {
    it('should correctly show the custom scss class', () => {
      const { host, page } = setup();
      host.selected = '1234'; // Ensure selected is truthy
      host.customScssClass = 'item-quality-q6';

      page.detectChanges();

      expect(page.mainText().nativeElement.classList).toContain('item-quality-q6');
    });
  });

  describe('when there is no custom scss class', () => {
    it('should correctly use the default scss class', () => {
      const { host, page } = setup();
      host.selected = '1234'; // Ensure selected is truthy
      host.customScssClass = undefined; // Falsy value

      page.detectChanges();

      expect(page.mainText().nativeElement.classList).toContain('main-text');
      expect(page.mainText().nativeElement.classList).toContain('text-truncate');
      expect(page.mainText().nativeElement.classList).not.toContain('item-quality-q6'); // Ensure no custom class
    });
  });

  describe('when the entity can be exported', () => {
    it('exports it through its handler', () => {
      const { host, page } = setup();
      const handler = { canExport: true, exportEntity: vi.fn() };
      host.selected = '1234';
      host.handler = handler as unknown as HandlerService<TableRow>;
      page.detectChanges();

      page.exportButton().nativeElement.click();

      expect(handler.exportEntity).toHaveBeenCalled();
    });

    it('shows no export button otherwise', () => {
      const { host, page } = setup();
      host.selected = '1234';
      host.handler = { canExport: false } as unknown as HandlerService<TableRow>;
      page.detectChanges();

      expect(page.exportButton(false)).toBeFalsy();
    });
  });

  describe('when there is a selected', () => {
    it('should correctly show a new selection', () => {
      const selected = '1234';
      const { host, page } = setup();

      host.selected = selected;
      host.isNew = true;
      page.detectChanges();

      expect(page.mainText().nativeElement.innerText).toContain(`Creating new: ${selected}`);
    });

    it('should correctly show an existing selection', () => {
      const selected = '1234';
      const selectedName = 'Shin';
      const { host, page } = setup();

      host.selected = selected;
      host.selectedName = selectedName;
      host.isNew = false;
      page.detectChanges();

      expect(page.mainText().nativeElement.innerText).toContain(`Editing: ${selectedName} (${selected})`);
    });
  });
});
