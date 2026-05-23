import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, Subject, throwError } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { DebugHtmlElement, getFormGroupOfDebugElement } from 'ngx-page-object-model';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { UnusedGuidSearchComponent } from './unused-guid-search.component';
import { MAX_INT_UNSIGNED_VALUE } from './unused-guid-search.service';

class UnusedGuidSearchPage extends PageObject<UnusedGuidSearchComponent> {
  get searchButton(): HTMLButtonElement {
    return this.getDebugElementByTestId<HTMLButtonElement>('search').nativeElement;
  }

  loadingElement(assert = true): DebugHtmlElement<HTMLDivElement> {
    return this.getDebugElementByTestId<HTMLDivElement>('loading', assert);
  }

  errorsElement(assert = true): DebugHtmlElement<HTMLDivElement> {
    return this.getDebugElementByTestId<HTMLDivElement>('errors', assert);
  }

  resultsTextareaElement(assert = true): DebugHtmlElement<HTMLTextAreaElement> {
    return this.getDebugElementByTestId<HTMLTextAreaElement>('results-textarea', assert);
  }

  get form(): FormGroup {
    return getFormGroupOfDebugElement(this.getDebugElementByTestId('unused-guid-search-form'));
  }

  get dbOptionElements(): HTMLOptionElement[] {
    const select = this.query<HTMLSelectElement>('select[formControlName="selectedDb"]');
    return Array.from(select.querySelectorAll('option'));
  }

  selectDbOptionByIndex(index: number): void {
    const select = this.query<HTMLSelectElement>('select[formControlName="selectedDb"]');
    select.selectedIndex = index;
    select.dispatchEvent(new Event('change'));
    this.fixture.detectChanges();
  }

  patchFormValues(values: { startIndex?: number; amount?: number; consecutive?: boolean }): void {
    this.form.patchValue(values);
    this.fixture.detectChanges();
  }

  clickSearch(): void {
    this.clickElement(this.searchButton);
  }

  get errorsText(): string {
    return this.errorsElement().nativeElement.textContent?.trim() ?? '';
  }

  get resultsValues(): string[] {
    return this.resultsTextareaElement()
      .nativeElement.value.split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
}

describe('UnusedGuidSearchComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UnusedGuidSearchComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        {
          provide: MysqlQueryService,
          useValue: { query: () => of([]) },
        },
      ],
    }).compileComponents();
  });

  function setup(mockGuids?: { guid: number }[]) {
    const fixture: ComponentFixture<UnusedGuidSearchComponent> = TestBed.createComponent(UnusedGuidSearchComponent);
    const page = new UnusedGuidSearchPage(fixture);
    const queryService: MysqlQueryService = TestBed.inject(MysqlQueryService);
    fixture.detectChanges();
    expect(page.searchButton).not.toBeNull();
    if (mockGuids) {
      vi.spyOn(queryService, 'query').mockReturnValue(of(mockGuids));
    }
    return { fixture, queryService, page };
  }

  describe('form validation', () => {
    it('should not allow a negative startIndex and produce an error without calling the query service', () => {
      const { page, queryService } = setup();
      const querySpy = vi.spyOn(queryService, 'query');

      page.patchFormValues({ startIndex: -1, amount: 10, consecutive: true });
      page.clickSearch();

      expect(page.errorsText).toContain('Please enter valid numbers');
      expect(querySpy).not.toHaveBeenCalled();
    });

    it('should set error and not call the service when startIndex is 0', () => {
      const { page, queryService } = setup();
      const querySpy = vi.spyOn(queryService, 'query');

      page.patchFormValues({ startIndex: 0, amount: 10, consecutive: false });
      page.clickSearch();

      expect(page.errorsText).toContain('Please enter valid numbers');
      expect(querySpy).not.toHaveBeenCalled();
    });

    it('should set error and not call the service when amount is 0', () => {
      const { page, queryService } = setup();
      const querySpy = vi.spyOn(queryService, 'query');

      page.patchFormValues({ startIndex: 1, amount: 0, consecutive: false });
      page.clickSearch();

      expect(page.errorsText).toContain('Please enter valid numbers');
      expect(querySpy).not.toHaveBeenCalled();
    });

    it('should set error and not call the service when startIndex exceeds MAX_INT_UNSIGNED_VALUE', () => {
      const { page, queryService } = setup();
      const querySpy = vi.spyOn(queryService, 'query');

      page.patchFormValues({ startIndex: MAX_INT_UNSIGNED_VALUE + 1, amount: 10, consecutive: false });
      page.clickSearch();

      expect(page.errorsText).toContain('Please enter valid numbers');
      expect(querySpy).not.toHaveBeenCalled();
    });

    it('should set error and not call the service when amount exceeds MAX_INT_UNSIGNED_VALUE', () => {
      const { page, queryService } = setup();
      const querySpy = vi.spyOn(queryService, 'query');

      page.patchFormValues({ startIndex: 1, amount: MAX_INT_UNSIGNED_VALUE + 1, consecutive: false });
      page.clickSearch();

      expect(page.errorsText).toContain('Please enter valid numbers');
      expect(querySpy).not.toHaveBeenCalled();
    });
  });

  describe('search wiring', () => {
    it('should produce no errors for each dbOption', () => {
      const { page } = setup([]);

      const optionCount = page.dbOptionElements.length;
      expect(optionCount).toBeGreaterThan(0);

      for (let i = 0; i < optionCount; i++) {
        page.selectDbOptionByIndex(i);
        page.patchFormValues({ startIndex: 1, amount: 1, consecutive: true });
        page.clickSearch();
        expect(page.errorsElement(false)).toBeNull();
      }
    });

    it('should handle query errors and set the error message', () => {
      const { queryService, page } = setup();
      vi.spyOn(queryService, 'query').mockReturnValue(throwError(() => new Error('db failure')));

      page.patchFormValues({ startIndex: 1, amount: 1, consecutive: false });
      page.clickSearch();

      expect(page.errorsText).toBe('db failure');
      expect(page.loadingElement(false)).toBeNull();
    });
  });

  describe('algorithm wiring through the DOM', () => {
    it('should find consecutive unused guids from db data and render them in the textarea', () => {
      const { page } = setup([{ guid: 1 }, { guid: 2 }, { guid: 4 }, { guid: 8 }, { guid: 9 }, { guid: 10 }]);

      page.patchFormValues({ startIndex: 1, amount: 3, consecutive: true });
      page.clickSearch();

      expect(page.resultsValues).toEqual(['5', '6', '7']);
    });

    it('should find non-consecutive unused guids from db data and render them in the textarea', () => {
      const { page } = setup([{ guid: 1 }, { guid: 2 }, { guid: 4 }, { guid: 8 }, { guid: 9 }, { guid: 10 }]);

      page.patchFormValues({ startIndex: 1, amount: 3, consecutive: false });
      page.clickSearch();

      expect(page.resultsValues).toEqual(['3', '5', '6']);
    });

    it('should set "Only found 0 unused GUIDs." when starting at MAX boundary with consecutive', () => {
      const { page } = setup([{ guid: 1 }]);

      page.patchFormValues({ startIndex: MAX_INT_UNSIGNED_VALUE, amount: 100, consecutive: true });
      page.clickSearch();

      expect(page.resultsTextareaElement(false)).toBeNull();
      expect(page.errorsText).toBe('Only found 0 unused GUIDs.');
    });

    it('should set "Only found 1 unused GUIDs." when starting at MAX boundary with non-consecutive', () => {
      const { page } = setup([{ guid: 1 }]);

      page.patchFormValues({ startIndex: MAX_INT_UNSIGNED_VALUE, amount: 100, consecutive: false });
      page.clickSearch();

      expect(page.resultsValues).toEqual([String(MAX_INT_UNSIGNED_VALUE)]);
      expect(page.errorsText).toBe('Only found 1 unused GUIDs.');
    });
  });

  describe('conditional render', () => {
    it('should show the loading alert while the query is in flight and hide it after completion', () => {
      const { page, queryService } = setup();
      const pending = new Subject<{ guid: number }[]>();
      vi.spyOn(queryService, 'query').mockReturnValue(pending);

      page.patchFormValues({ startIndex: 1, amount: 1, consecutive: false });
      page.clickSearch();

      expect(page.loadingElement().nativeElement).toBeTruthy();

      pending.next([]);
      pending.complete();
      page.detectChanges();

      expect(page.loadingElement(false)).toBeNull();
    });

    it('should hide the loading alert immediately after a synchronous resolution', () => {
      const { page } = setup([]);

      page.patchFormValues({ startIndex: 1, amount: 1, consecutive: false });
      page.clickSearch();

      expect(page.loadingElement(false)).toBeNull();
    });

    it('should not render the results textarea until a successful search emits at least one guid', () => {
      const { page } = setup([{ guid: 99 }]);

      expect(page.resultsTextareaElement(false)).toBeNull();

      page.patchFormValues({ startIndex: 1, amount: 1, consecutive: false });
      page.clickSearch();

      expect(page.resultsTextareaElement().nativeElement).toBeTruthy();
      expect(page.resultsValues).toEqual(['1']);
    });

    it('should not render the errors div by default', () => {
      const { page } = setup();
      expect(page.errorsElement(false)).toBeNull();
    });
  });
});
