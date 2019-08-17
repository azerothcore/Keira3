import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { GameobjectTemplateService } from './gameobject-template.service';
import { QueryService } from '../../query.service';
import { MockedQueryService } from '../../../test-utils/mocks';
import { GO_DATA_FIELDS } from '../../../constants/gameobject-types';

describe('GameobjectTemplateService', () => {

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  it('should be created', () => {
    const gameobjectService: GameobjectTemplateService = TestBed.get(GameobjectTemplateService);
    expect(gameobjectService).toBeTruthy();
  });

  it('changing type and the related fields data*', () => {
    const gameobjectService: GameobjectTemplateService = TestBed.get(GameobjectTemplateService);
    expect(gameobjectService.getFieldDefinition(0, 0)).toBe(GO_DATA_FIELDS[0][0]);
    expect(gameobjectService.getFieldDefinition(0, 25)).toEqual({ name: `Data25`, tooltip: null });
  });

});
