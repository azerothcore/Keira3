import { TestBed } from '@angular/core/testing';

import { ConnectionWindowService } from './connection-window.service';

describe('ConnectionWindowService', () => {
  let service: ConnectionWindowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConnectionWindowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
