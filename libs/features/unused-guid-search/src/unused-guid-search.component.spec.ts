import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { UnusedGuidSearchComponent } from './unused-guid-search.component';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { MAX_INT_UNSIGNED_VALUE } from './unused-guid-search.service';
import { getFormGroupOfDebugElement } from 'ngx-page-object-model';
import { FormGroup } from '@angular/forms';

class UnusedGuidSearchPage extends PageObject<UnusedGuidSearchComponent> {
  get searchButton(): HTMLButtonElement {
    return this.getDebugElementByTestId<HTMLButtonElement>('search').nativeElement;
  }
  get loading(): HTMLDivElement | null {
    const debugEl = this.getDebugElementByTestId<HTMLDivElement>('loading', false);
    return debugEl ? debugEl.nativeElement : null;
  }
  get errors(): HTMLDivElement | null {
    const debugEl = this.getDebugElementByTestId<HTMLDivElement>('errors', false);
    return debugEl ? debugEl.nativeElement : null;
  }
  get form(): FormGroup {
    const debugEl = this.getDebugElementByTestId('unused-guid-search-form');
    return getFormGroupOfDebugElement(debugEl);
  }
}

describe('UnusedGuidSearchComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [UnusedGuidSearchComponent, TranslateTestingModule],
      providers: [
        {
          provide: MysqlQueryService,
          useValue: { query: () => of([]) },
        },
      ],
    }).compileComponents();
  }));

  function setupTest(mockGuids?: { guid: number }[]) {
    const fixture: ComponentFixture<UnusedGuidSearchComponent> = TestBed.createComponent(UnusedGuidSearchComponent);
    const component = fixture.componentInstance;
    const page = new UnusedGuidSearchPage(fixture);
    const queryService: MysqlQueryService = TestBed.inject(MysqlQueryService);
    fixture.detectChanges();
    expect(page.searchButton).not.toBeNull();
    if (mockGuids) {
      spyOn(queryService, 'query').and.returnValue(of(mockGuids));
    }
    return { fixture, component, queryService, page };
  }

  it('should not allow a negative startIndex and produce an error', () => {
    const { component, page, fixture } = setupTest([{ guid: 1 }, { guid: 2 }, { guid: 4 }, { guid: 8 }, { guid: 9 }, { guid: 10 }]);
    page.form.patchValue({
      selectedDb: component['dbOptions'][0], // creature
      startIndex: -1,
      amount: 10,
      consecutive: true,
    });
    fixture.detectChanges();
    page.clickElement(page.searchButton);
    expect(page.errors?.textContent).not.toBe('');
  });

  it('should find consecutive unused guids from db data', () => {
    const { component, page } = setupTest([{ guid: 1 }, { guid: 2 }, { guid: 4 }, { guid: 8 }, { guid: 9 }, { guid: 10 }]);

    page.form.patchValue({
      selectedDb: component['dbOptions'][0], // creature
      startIndex: 1,
      amount: 3,
      consecutive: true,
    });
    page.clickElement(page.searchButton);

    expect(component['results']).toEqual(['5', '6', '7']);
  });

  it('should find non-consecutive unused guids from db data', () => {
    const { component, page } = setupTest([{ guid: 1 }, { guid: 2 }, { guid: 4 }, { guid: 8 }, { guid: 9 }, { guid: 10 }]);

    page.form.patchValue({
      selectedDb: component['dbOptions'][0], // creature
      startIndex: 1,
      amount: 3,
      consecutive: false,
    });
    page.clickElement(page.searchButton);

    expect(component['results']).toEqual(['3', '5', '6']);
  });

  it('should produce no errors for each dbOption', () => {
    const { component, page } = setupTest([]);

    for (const dbOpt of component['dbOptions']) {
      page.form.patchValue({
        selectedDb: dbOpt,
        startIndex: 1,
        amount: 1,
        consecutive: true,
      });
      page.clickElement(page.searchButton);
      expect(page.errors).toBeNull();
    }
  });

  it('should handle query errors and set the error message', () => {
    const { component, queryService, page } = setupTest();
    spyOn(queryService, 'query').and.returnValue(throwError(() => new Error('db failure')));
    page.form.patchValue({
      selectedDb: component['dbOptions'][0],
      startIndex: 1,
      amount: 1,
      consecutive: false,
    });
    page.clickElement(page.searchButton);
    expect(page.errors?.textContent).toBe('db failure');
    expect(page.loading).toBeNull();
  });

  it('should set "Only found 0 unused GUIDs." when starting at MAX boundary with consecutive', () => {
    const { component, page } = setupTest([{ guid: 1 }]);
    page.form.patchValue({
      selectedDb: component['dbOptions'][0],
      startIndex: MAX_INT_UNSIGNED_VALUE,
      amount: 100,
      consecutive: true,
    });
    page.clickElement(page.searchButton);
    expect(component['results'].length).toBe(0);
    expect(page.errors?.textContent).toBe('Only found 0 unused GUIDs.');
  });

  it('should set "Only found 1 unused GUIDs." when starting at MAX boundary with non-consecutive', () => {
    const { component, page } = setupTest([{ guid: 1 }]);
    page.form.patchValue({
      selectedDb: component['dbOptions'][0],
      startIndex: MAX_INT_UNSIGNED_VALUE,
      amount: 100,
      consecutive: false,
    });
    page.clickElement(page.searchButton);
    expect(component['results'].length).toBe(1);
    expect(page.errors?.textContent).toBe('Only found 1 unused GUIDs.');
  });
});
