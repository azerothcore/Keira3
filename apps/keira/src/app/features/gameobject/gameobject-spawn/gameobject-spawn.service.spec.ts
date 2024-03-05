import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedMysqlQueryService, MockedToastrService, MysqlQueryService } from '@keira/shared/core';

import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { GameobjectSpawnService } from './gameobject-spawn.service';

describe('GameobjectSpawnService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
        GameobjectSpawnService,
      ],
    }),
  );

  it('should be created', () => {
    const service: GameobjectSpawnService = TestBed.inject(GameobjectSpawnService);
    expect(service).toBeTruthy();
  });
});
