import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { UnusedGuidSearchComponent } from './unused-guid-search.component';
import { MysqlQueryService } from '@keira/shared/db-layer';

describe('UnusedGuidSearchComponent', () => {
  let fixture: ComponentFixture<UnusedGuidSearchComponent>;
  let queryService: MysqlQueryService;

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
    fixture = TestBed.createComponent(UnusedGuidSearchComponent);
    const component = fixture.componentInstance;
    queryService = TestBed.inject(MysqlQueryService);
    if (mockGuids) {
      spyOn(queryService, 'query').and.returnValue(of(mockGuids));
    }
    return { fixture, component };
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
});
