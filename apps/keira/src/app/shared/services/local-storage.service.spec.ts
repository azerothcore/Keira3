import { inject, TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';

import Spy = jasmine.Spy;

describe('LocalStorageService', () => {
  let mockStorage;

  let spyClear: Spy;
  let spyGetItem: Spy;
  let spyKey: Spy;
  let spyRemoveItem: Spy;
  let spySetItem: Spy;

  const key = 'myKey';
  const value = 'myValue';

  beforeEach(() => {
    TestBed.configureTestingModule({});

    spyClear = spyOn(Storage.prototype, 'clear');
    spyGetItem = spyOn(Storage.prototype, 'getItem');
    spyKey = spyOn(Storage.prototype, 'key');
    spyRemoveItem = spyOn(Storage.prototype, 'removeItem');
    spySetItem = spyOn(Storage.prototype, 'setItem');

    // mock localStorage
    mockStorage = {};
    spyGetItem.and.callFake((k) => mockStorage[k]);
    spySetItem.and.callFake((k, v) => (mockStorage[k] = v));
    spyClear.and.callFake(() => {
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
      spyGetItem.and.returnValue(value);
      expect(service.getItem(key)).toEqual(value);
      expect(spyGetItem).toHaveBeenCalledTimes(1);
    }));

    it('key', inject([LocalStorageService], (service: LocalStorageService) => {
      spyKey.and.returnValue(value);
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
