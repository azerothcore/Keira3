import { TestBed } from '@angular/core/testing';

import { LocalStorageService } from './localstorage.service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    service = TestBed.get(LocalStorageService);
    service.clear();
  });

  it('setItem should correctly work', () => {
    expect(service.getItem('a')).not.toBe('b');

    service.setItem('a', 'b');

    expect(service.getItem('a')).toBe('b');
  });

  it('getItem should correctly work', () => {
    service.setItem('a', 'b');
    expect(service.getItem('a')).toBe('b');
  });

  it('removeItem should correctly work', () => {
    service.setItem('a', 'b');
    expect(service.getItem('a')).toBe('b');

    service.removeItem('a');
    expect(service.getItem('a')).not.toBe('b');
    expect(service.getItem('a')).toBeNull();
  });

  it('key() should correctly work', () => {
    service.clear();

    service.setItem('a', 'b');

    expect(service.key(0)).toBe('a');
    expect(service.key(1)).toBeNull();
  });


  it('clear should correctly work', () => {
    service.setItem('a', 'b');
    expect(service.getItem('a')).toBe('b');

    service.clear();
    expect(service.getItem('a')).not.toBe('b');
  });
});
