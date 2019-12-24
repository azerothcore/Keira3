import { TestBed } from '@angular/core/testing';

import { LocalStorageService } from './localstorage.service';

describe('LocalStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});

    localStorage.clear();
  });

  it('setitem should correctly work', () => {
    const service: LocalStorageService = TestBed.get(LocalStorageService);

    expect(localStorage.getItem('a')).not.toBe('b');

    service.setItem('a', 'b');

    expect(localStorage.getItem('a')).toBe('b');
  });

  it('clear should correctly work', () => {
    const service: LocalStorageService = TestBed.get(LocalStorageService);

    localStorage.setItem('a', 'b');
    expect(localStorage.getItem('a')).toBe('b');

    service.clear();
    expect(localStorage.getItem('a')).not.toBe('b');
  });
});
