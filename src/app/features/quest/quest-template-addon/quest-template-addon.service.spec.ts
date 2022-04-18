import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestTemplateAddonService } from './quest-template-addon.service';

describe('QuestTemplateAddonService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        QuestHandlerService,
        QuestTemplateAddonService,
      ],
    }),
  );

  it('should be created', () => {
    const service: QuestTemplateAddonService = TestBed.inject(QuestTemplateAddonService);
    expect(service).toBeTruthy();
  });
});
