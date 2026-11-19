import { TestBed } from '@angular/core/testing';
import { SESSION_SQL_KEY, SessionSqlService } from './session-sql.service';

describe('SessionSqlService', () => {
  beforeEach(() => localStorage.clear());

  it('keeps the queries added, in order, until cleared, also after Keira restarts', () => {
    const service = TestBed.inject(SessionSqlService);
    service.add('creature_template 1', 'UPDATE a;');
    service.add('smart_scripts 1', ' DELETE b; ');
    service.add('nothing', '  ');

    expect(service.entries().map((entry) => entry.label)).toEqual(['creature_template 1', 'smart_scripts 1']);
    expect(service.combined()).toBe('-- creature_template 1\nUPDATE a;\n\n-- smart_scripts 1\nDELETE b;\n');

    TestBed.resetTestingModule();
    const again = TestBed.inject(SessionSqlService);
    expect(again.entries().length).toBe(2);
    again.clear();
    expect(again.entries()).toEqual([]);
  });

  it('moves and removes entries', () => {
    const service = TestBed.inject(SessionSqlService);
    service.add('a', '1');
    service.add('b', '2');
    service.add('c', '3');
    const [a, b, c] = service.entries();

    service.move(c.id, -1);
    service.move(a.id, -1);
    service.move(a.id, 1);
    service.move(999, 1);
    expect(service.entries().map((entry) => entry.label)).toEqual(['c', 'a', 'b']);
    service.move(b.id, 1);
    service.remove(a.id);
    expect(service.entries().map((entry) => entry.label)).toEqual(['c', 'b']);
    service.add('d', '4');
    expect(service.entries().at(-1)?.id).toBe(4);
  });

  it('starts empty when the stored session is unreadable, and keeps going when storage is blocked', () => {
    localStorage.setItem(SESSION_SQL_KEY, '{oops');
    expect(TestBed.inject(SessionSqlService).entries()).toEqual([]);
    TestBed.resetTestingModule();
    localStorage.setItem(SESSION_SQL_KEY, JSON.stringify([{ label: 'ok', query: 'Q', id: 1, at: '' }, { label: 2 }, null]));
    const service = TestBed.inject(SessionSqlService);
    expect(service.entries().length).toBe(1);
    TestBed.resetTestingModule();
    localStorage.setItem(SESSION_SQL_KEY, '{"not":"a list"}');
    expect(TestBed.inject(SessionSqlService).entries()).toEqual([]);

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full');
    });
    service.add('kept', 'Q2');
    expect(service.entries().length).toBe(2);
    vi.restoreAllMocks();
  });
});
