import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UnusedGuidSearchComponent } from './unused-guid-search.component';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { MAX_INT_UNSIGNED_VALUE } from './unused-guid-search.service';

describe('UnusedGuidSearchComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [UnusedGuidSearchComponent],
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
    const queryService: MysqlQueryService = TestBed.inject(MysqlQueryService);
    if (mockGuids) {
      spyOn(queryService, 'query').and.returnValue(of(mockGuids));
    }
    return { fixture, component, queryService };
  }

  it('should not allow a negative startIndex and produce an error', () => {
    const { component } = setupTest([{ guid: 1 }, { guid: 2 }, { guid: 4 }, { guid: 8 }, { guid: 9 }, { guid: 10 }]);

    component['form'].patchValue({
      selectedDb: component['dbOptions'][0], // creature
      startIndex: -1,
      amount: 10,
      consecutive: true,
    });
    component['onSearch']();
    expect(component['error']()).not.toBe('');
  });

  it('should find consecutive unused guids from db data', () => {
    const { component } = setupTest([{ guid: 1 }, { guid: 2 }, { guid: 4 }, { guid: 8 }, { guid: 9 }, { guid: 10 }]);

    component['form'].patchValue({
      selectedDb: component['dbOptions'][0], // creature
      startIndex: 1,
      amount: 3,
      consecutive: true,
    });
    component['onSearch']();

    expect(component['results']).toEqual(['5', '6', '7']);
  });

  it('should find non-consecutive unused guids from db data', () => {
    const { component } = setupTest([{ guid: 1 }, { guid: 2 }, { guid: 4 }, { guid: 8 }, { guid: 9 }, { guid: 10 }]);

    component['form'].patchValue({
      selectedDb: component['dbOptions'][0], // creature
      startIndex: 1,
      amount: 3,
      consecutive: false,
    });
    component['onSearch']();

    expect(component['results']).toEqual(['3', '5', '6']);
  });

  it('should produce no errors for each dbOption', () => {
    const { component } = setupTest([]);

    for (const dbOpt of component['dbOptions']) {
      component['form'].patchValue({
        selectedDb: dbOpt,
        startIndex: 1,
        amount: 1,
        consecutive: true,
      });
      component['onSearch']();
      expect(component['error']()).toBe('');
    }
  });

  it('should handle query errors and set the error message', () => {
    const { component, queryService } = setupTest();
    spyOn(queryService, 'query').and.returnValue(throwError(() => new Error('db failure')));
    component['form'].patchValue({
      selectedDb: component['dbOptions'][0],
      startIndex: 1,
      amount: 1,
      consecutive: false,
    });
    component['onSearch']();
    expect(component['error']()).toBe('db failure');
    expect(component['loading']()).toBeFalse();
  });

  it('should set "Only found 0 unused GUIDs." when starting at MAX boundary with consecutive', () => {
    const { component } = setupTest([{ guid: 1 }]);
    component['form'].patchValue({
      selectedDb: component['dbOptions'][0],
      startIndex: MAX_INT_UNSIGNED_VALUE,
      amount: 100,
      consecutive: true,
    });
    component['onSearch']();
    expect(component['results'].length).toBe(0);
    expect(component['error']()).toBe('Only found 0 unused GUIDs.');
  });

  it('should set "Only found 1 unused GUIDs." when starting at MAX boundary with non-consecutive', () => {
    const { component } = setupTest([{ guid: 1 }]);
    component['form'].patchValue({
      selectedDb: component['dbOptions'][0],
      startIndex: MAX_INT_UNSIGNED_VALUE,
      amount: 100,
      consecutive: false,
    });
    component['onSearch']();
    expect(component['results'].length).toBe(1);
    expect(component['error']()).toBe('Only found 1 unused GUIDs.');
  });
});
