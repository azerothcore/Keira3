import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { instance, mock } from 'ts-mockito';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { SelectGameobjectService } from './select-gameobject.service';

describe('SelectGameobjectService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
        SelectGameobjectService,
      ],
    }),
  );

  it('should be created', () => {
    const service: SelectGameobjectService = TestBed.inject(SelectGameobjectService);
    expect(service).toBeTruthy();
  });
});
