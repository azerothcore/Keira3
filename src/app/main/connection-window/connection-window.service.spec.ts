import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from '@keira-shared/services/local-storage.service';
import { Spied } from '@keira-testing/test-helpers';
import { ConnectionConfig } from 'mysql2';
import { ConnectionWindowService } from './connection-window.service';

declare type Config = Partial<ConnectionConfig>;

describe('ConnectionWindowService', () => {
  const currentConfig: Config[] = [
    { host: '185.251.90.84', port: 3306, user: 'readonly', password: 'cmVhZG9ubHk=', database: 'world' },
    { host: '127.0.0.1', port: 3306, user: 'root', password: 'cm9vdA==', database: 'acore_world' },
  ];
  Object.freeze(currentConfig);

  const setup = () => {
    const localStorageService: Spied<LocalStorageService> = jasmine.createSpyObj('LocalStorageService', [
      'removeItem',
      'getItem',
      'setItem',
    ]);
    TestBed.configureTestingModule({
      providers: [{ provide: LocalStorageService, useValue: localStorageService }],
    });
    const service = TestBed.inject(ConnectionWindowService);

    return { service, localStorageService };
  };

  it('removeAllConfigs() should correctly work', () => {
    const { service, localStorageService } = setup();
    service.removeAllConfigs();
    expect(localStorageService.removeItem).toHaveBeenCalledTimes(1);
    expect(localStorageService.removeItem).toHaveBeenCalledWith(service.KEY);
  });

  describe('saveNewConfig(newConfig)', () => {
    it('saving an existing config should correctly update its password', () => {
      const { service, localStorageService } = setup();
      localStorageService.getItem.and.returnValue(JSON.stringify(currentConfig));
      const newPassword = 'shin123';

      service.saveNewConfig({
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: newPassword,
        database: 'acore_world',
      });

      const expectedNewConfig = [{ ...currentConfig[0] }, { ...currentConfig[1] }];
      expectedNewConfig[1].password = btoa(newPassword);
      expect(localStorageService.setItem).toHaveBeenCalledTimes(1);
      expect(localStorageService.setItem).toHaveBeenCalledWith(service.KEY, JSON.stringify(expectedNewConfig));
    });

    it('saving an existing config should put it at the end of the config array', () => {
      const { service, localStorageService } = setup();
      localStorageService.getItem.and.returnValue(JSON.stringify(currentConfig));

      service.saveNewConfig(currentConfig[0]);

      const expectedNewConfig = [currentConfig[1], currentConfig[0]];
      expect(localStorageService.setItem).toHaveBeenCalledTimes(1);
      expect(localStorageService.setItem).toHaveBeenCalledWith(service.KEY, JSON.stringify(expectedNewConfig));
    });

    it('saving a new config should correctly work', () => {
      const { service, localStorageService } = setup();
      localStorageService.getItem.and.returnValue(JSON.stringify(currentConfig));
      const newPassword = 'shin123';
      const newConfig = {
        host: '192.168.1.100',
        port: 3306,
        user: 'root',
        password: newPassword,
        database: 'acore_world',
      };

      service.saveNewConfig(newConfig);

      const expectedNewConfig = [{ ...currentConfig[0] }, { ...currentConfig[1] }, { ...newConfig }];
      expectedNewConfig[2].password = btoa(newPassword);
      expect(localStorageService.setItem).toHaveBeenCalledTimes(1);
      expect(localStorageService.setItem).toHaveBeenCalledWith(service.KEY, JSON.stringify(expectedNewConfig));
    });
  });

  describe('getConfigs()', () => {
    it('should correctly return the current config', () => {
      const { service, localStorageService } = setup();
      localStorageService.getItem.and.returnValue(JSON.stringify(currentConfig));

      const expectedNewConfig = [{ ...currentConfig[0] }, { ...currentConfig[1] }];
      expectedNewConfig[0].password = atob(expectedNewConfig[0].password);
      expectedNewConfig[1].password = atob(expectedNewConfig[1].password);
      expect(service.getConfigs()).toEqual(expectedNewConfig);
    });

    it('should return an empty array if there is no config', () => {
      const { service, localStorageService } = setup();
      localStorageService.getItem.and.returnValue(null);

      expect(service.getConfigs()).toEqual([]);
    });
  });
});
