import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { SelectCreatureService } from './select-creature.service';

describe('SelectCreatureService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        CreatureHandlerService,
        SaiCreatureHandlerService,
        SelectCreatureService,
      ],
    }),
  );

  it('should be created', () => {
    const service: SelectCreatureService = TestBed.inject(SelectCreatureService);
    expect(service).toBeTruthy();
  });
});
