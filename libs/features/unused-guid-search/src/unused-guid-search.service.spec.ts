import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { instance, mock } from 'ts-mockito';
import { of, throwError } from 'rxjs';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { DbOptions, MAX_INT_UNSIGNED_VALUE, UnusedGuidService } from './unused-guid-search.service';

const DB_OPT: DbOptions = { table: 'creature', key: 'guid', label: 'creature (guid)' };

function setup(rows: { guid: number }[] | 'error' = []) {
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideNoopAnimations(),
      {
        provide: MysqlQueryService,
        useValue: {
          query: rows === 'error' ? vi.fn().mockReturnValue(throwError(() => new Error('boom'))) : vi.fn().mockReturnValue(of(rows)),
        },
      },
    ],
  });

  const service = TestBed.inject(UnusedGuidService);
  const mysql = TestBed.inject(MysqlQueryService);
  return { service, mysql };
}

describe('UnusedGuidSearchService', () => {
  it('should be defined', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
      ],
    });
    const service: UnusedGuidService = TestBed.inject(UnusedGuidService);
    expect(service).toBeDefined();
  });

  it('findUnusedGuids returns N non-consecutive unused values starting at startIndex', () => {
    const { service } = setup([{ guid: 1 }, { guid: 2 }, { guid: 4 }]);

    let emitted: string[] | undefined;
    service.search(DB_OPT, 1, 3, false).subscribe((v) => (emitted = v));

    expect(emitted).toEqual(['3', '5', '6']);
  });

  it('findConsecutiveUnusedGuids returns the first run of length N', () => {
    const { service } = setup([{ guid: 1 }, { guid: 2 }, { guid: 4 }, { guid: 8 }, { guid: 9 }, { guid: 10 }]);

    let emitted: string[] | undefined;
    service.search(DB_OPT, 1, 3, true).subscribe((v) => (emitted = v));

    expect(emitted).toEqual(['5', '6', '7']);
  });

  it('findUnusedGuids honours the MAX_INT_UNSIGNED_VALUE break', () => {
    const { service } = setup([]);

    let emitted: string[] | undefined;
    service.search(DB_OPT, MAX_INT_UNSIGNED_VALUE - 1, 100, false).subscribe((v) => (emitted = v));

    expect(emitted).toEqual([String(MAX_INT_UNSIGNED_VALUE - 1)]);
  });

  it('findConsecutiveUnusedGuids honours the MAX_INT_UNSIGNED_VALUE break', () => {
    const { service } = setup([]);

    let emitted: string[] | undefined;
    service.search(DB_OPT, MAX_INT_UNSIGNED_VALUE - 1, 100, true).subscribe((v) => (emitted = v));

    expect(emitted).toEqual([]);
  });

  it('forwards the query: SELECT key AS guid FROM table WHERE key >= startIndex', () => {
    const { service, mysql } = setup([]);

    service.search(DB_OPT, 42, 1, false).subscribe();

    const sql = (mysql.query as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(sql).toContain('SELECT guid AS guid');
    expect(sql).toContain('FROM creature');
    expect(sql).toContain('WHERE guid >= 42');
  });

  it('propagates a MysqlQueryService error wrapped as Error with the original message', () => {
    const { service } = setup('error');

    const nextSpy = vi.fn();
    let captured: Error | undefined;
    service.search(DB_OPT, 1, 1, false).subscribe({
      next: nextSpy,
      error: (err: Error) => (captured = err),
    });

    expect(nextSpy).not.toHaveBeenCalled();
    expect(captured).toBeInstanceOf(Error);
    expect(captured?.message).toBe('boom');
  });
});
