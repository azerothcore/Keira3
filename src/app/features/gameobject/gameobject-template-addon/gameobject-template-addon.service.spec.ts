import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { GameobjectTemplateAddonService } from './gameobject-template-addon.service';
import { QueryService } from '@keira-shared/services/query.service';
import { MockedQueryService, MockedToastrService } from '@keira-testing/mocks';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';

describe('GameobjectTemplateAddonService', () => {

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      GameobjectHandlerService,
      SaiGameobjectHandlerService,
      GameobjectTemplateAddonService
    ]
  }));

  it('should be created', () => {
    const service: GameobjectTemplateAddonService = TestBed.get(GameobjectTemplateAddonService);
    expect(service).toBeTruthy();
  });
});
