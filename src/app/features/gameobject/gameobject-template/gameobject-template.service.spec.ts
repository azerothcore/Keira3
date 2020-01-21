import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { GameobjectTemplateService } from './gameobject-template.service';
import { QueryService } from '@keira-shared/services/query.service';
import { MockedQueryService, MockedToastrService } from '@keira-testing/mocks';
import { GO_DATA_FIELDS } from '@keira-constants/gameobject-types';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';

describe('GameobjectTemplateService', () => {

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      GameobjectHandlerService,
      SaiGameobjectHandlerService,
      GameobjectTemplateService,
    ]
  }));

  it('should correctly return the definition according to the type', () => {
    const gameobjectService: GameobjectTemplateService = TestBed.get(GameobjectTemplateService);
    expect(gameobjectService.getFieldDefinition(0, 0)).toBe(GO_DATA_FIELDS[0][0]);
  });

  it('should correctly return a default value when the definition is missing', () => {
    const gameobjectService: GameobjectTemplateService = TestBed.get(GameobjectTemplateService);
    expect(gameobjectService.getFieldDefinition(0, 25)).toEqual({ name: `Data25`, tooltip: null });
  });

});
