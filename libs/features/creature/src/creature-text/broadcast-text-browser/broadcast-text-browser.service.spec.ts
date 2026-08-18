import { ChangeDetectorRef, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BroadcastText } from '@keira/shared/acore-world-model';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { vi } from 'vitest';
import { BroadcastTextRow, getBroadcastTextRow } from './broadcast-text-browser.model';
import { BroadcastTextBrowserService } from './broadcast-text-browser.service';

describe('BroadcastTextBrowserService', () => {
  const changeDetectorRef = { markForCheck: () => {} } as ChangeDetectorRef;

  const broadcastText = (ID: number, MaleText = `text ${ID}`, FemaleText = ''): BroadcastText =>
    ({ ...new BroadcastText(), ID, MaleText, FemaleText }) as BroadcastText;

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
      ],
    }),
  );

  function setup() {
    const queryService = TestBed.inject(MysqlQueryService);
    vi.spyOn(queryService, 'getBroadcastTextSearchQuery').mockImplementation((text) => `SEARCH ${text}`);
    vi.spyOn(queryService, 'getBroadcastTextAdjacentQuery').mockImplementation((id, range) => `ADJACENT ${id} ${range}`);
    const service = TestBed.inject(BroadcastTextBrowserService);

    return { service, queryService };
  }

  it('should be created', () => {
    const { service } = setup();
    expect(service).toBeTruthy();
  });

  it('should keep the query in sync with the search form', () => {
    const { service } = setup();
    expect(service.query).toBe('SEARCH ');

    service.searchForm.controls.text.setValue('hello');

    expect(service.query).toBe('SEARCH hello');
  });

  describe('onSearch()', () => {
    it('should show the matching rows, each reduced to a single text', () => {
      const { service, queryService } = setup();
      const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([broadcastText(10), broadcastText(11, '', 'she says')]));
      service.searchForm.controls.text.setValue('says');

      service.onSearch(changeDetectorRef);

      expect(querySpy).toHaveBeenCalledWith('SEARCH says');
      expect(service.rows).toEqual([
        expect.objectContaining({ ID: 10, Text: 'text 10' }),
        expect.objectContaining({ ID: 11, Text: 'she says' }),
      ]);
      expect(service.matchedId).toBeUndefined();
    });

    it('should show the rows around a single hit, flagging the hit itself', () => {
      const { service, queryService } = setup();
      const querySpy = vi
        .spyOn(queryService, 'query')
        .mockReturnValueOnce(of([broadcastText(25)]))
        .mockReturnValueOnce(of([broadcastText(24), broadcastText(25), broadcastText(26)]));

      service.onSearch(changeDetectorRef);

      expect(querySpy).toHaveBeenLastCalledWith('ADJACENT 25 5');
      expect(service.rows?.map(({ ID }) => ID)).toEqual([24, 25, 26]);
      expect(service.matchedId).toBe(25);
      expect(service.isMatchedRow(service.rows?.[0] as BroadcastTextRow)).toBe(false);
      expect(service.isMatchedRow(service.rows?.[1] as BroadcastTextRow)).toBe(true);
    });

    it('should forget the previous hit when a later search matches several rows', () => {
      const { service, queryService } = setup();
      vi.spyOn(queryService, 'query')
        .mockReturnValueOnce(of([broadcastText(25)]))
        .mockReturnValueOnce(of([broadcastText(25)]))
        .mockReturnValueOnce(of([broadcastText(30), broadcastText(31)]));

      service.onSearch(changeDetectorRef);
      expect(service.matchedId).toBe(25);

      service.onSearch(changeDetectorRef);

      expect(service.matchedId).toBeUndefined();
      expect(service.isMatchedRow(service.rows?.[0] as BroadcastTextRow)).toBe(false);
    });

    it('should drop the previous selection', () => {
      const { service, queryService } = setup();
      vi.spyOn(queryService, 'query').mockReturnValue(of([broadcastText(10), broadcastText(11)]));
      service.onSelect({ selected: [getBroadcastTextRow(broadcastText(10))] });

      service.onSearch(changeDetectorRef);

      expect(service.selectedRow).toBeUndefined();
    });
  });

  it('onSelect() should keep the clicked row', () => {
    const { service } = setup();
    const row = getBroadcastTextRow(broadcastText(10));

    service.onSelect({ selected: [row] });

    expect(service.selectedRow).toBe(row);
  });
});
