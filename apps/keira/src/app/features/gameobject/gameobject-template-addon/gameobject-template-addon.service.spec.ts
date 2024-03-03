import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/core';
import { MockedMysqlQueryService, MockedToastrService } from '@keira/test-utils';
import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { GameobjectTemplateAddonService } from './gameobject-template-addon.service';

describe('GameobjectTemplateAddonService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
        GameobjectTemplateAddonService,
      ],
    }),
  );

  it('should be created', () => {
    const service: GameobjectTemplateAddonService = TestBed.inject(GameobjectTemplateAddonService);
    expect(service).toBeTruthy();
  });
});
