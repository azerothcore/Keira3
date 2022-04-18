import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
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
