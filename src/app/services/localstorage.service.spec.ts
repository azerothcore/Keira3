import { TestBed } from '@angular/core/testing';

import { LocalstorageService } from './localstorage.service';

describe('LocalstorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});

    localStorage.clear();
  });

  it('setitem should correctly work', () => {
    const service: LocalstorageService = TestBed.get(LocalstorageService);

    expect(localStorage.getItem('a')).not.toBe('b');

    service.setItem('a', 'b');

    expect(localStorage.getItem('a')).toBe('b');
  });

  it('clear should correctly work', () => {
    const service: LocalstorageService = TestBed.get(LocalstorageService);

    localStorage.setItem('a', 'b');
    expect(localStorage.getItem('a')).toBe('b');

    service.clear();
    expect(localStorage.getItem('a')).not.toBe('b');
  });
});
