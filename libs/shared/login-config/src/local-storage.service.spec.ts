import { vi, type MockInstance } from 'vitest';
import { inject, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let mockStorage: any;

  let spyClear: MockInstance;
  let spyGetItem: MockInstance;
  let spyKey: MockInstance;
  let spyRemoveItem: MockInstance;
  let spySetItem: MockInstance;

  const key = 'myKey';
  const value = 'myValue';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    });

    spyClear = vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => undefined);
    spyGetItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => undefined);
    spyKey = vi.spyOn(Storage.prototype, 'key').mockImplementation(() => undefined);
    spyRemoveItem = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => undefined);
    spySetItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => undefined);

    // mock localStorage
    mockStorage = {};
    spyGetItem.mockImplementation((k) => mockStorage[k]);
    spySetItem.mockImplementation((k, v) => (mockStorage[k] = v));
    spyClear.mockImplementation(() => {
      mockStorage = {};
    });
  });

  it('should be created', inject([LocalStorageService], (service: LocalStorageService) => {
    expect(service).toBeTruthy();
  }));

  describe('should correctly provide all the storage methods', () => {
    it('length', inject([LocalStorageService], (service: LocalStorageService) => {
      expect(service.length).toBeDefined();
    }));

    it('clear', inject([LocalStorageService], (service: LocalStorageService) => {
      service.clear();
      expect(spyClear).toHaveBeenCalledTimes(1);
    }));

    it('getItem', inject([LocalStorageService], (service: LocalStorageService) => {
      spyGetItem.mockReturnValue(value);
      expect(service.getItem(key)).toEqual(value);
      expect(spyGetItem).toHaveBeenCalledTimes(1);
    }));

    it('key', inject([LocalStorageService], (service: LocalStorageService) => {
      spyKey.mockReturnValue(value);
      expect(service.key(1)).toEqual(value);
      expect(spyKey).toHaveBeenCalledTimes(1);
    }));

    it('removeItem', inject([LocalStorageService], (service: LocalStorageService) => {
      service.removeItem(key);
      expect(spyRemoveItem).toHaveBeenCalledTimes(1);
    }));

    it('setItem', inject([LocalStorageService], (service: LocalStorageService) => {
      service.setItem(key, value);
      expect(spySetItem).toHaveBeenCalledTimes(1);
    }));
  });
});
