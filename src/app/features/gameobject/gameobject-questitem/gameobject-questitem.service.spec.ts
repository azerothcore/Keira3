import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
import { GameobjectQuestitemService } from './gameobject-questitem.service';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';

describe('GameobjectQuestitemService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      GameobjectHandlerService,
      SaiGameobjectHandlerService,
      GameobjectQuestitemService,
    ]
  }));

  it('should be created', () => {
    const service: GameobjectQuestitemService = TestBed.inject(GameobjectQuestitemService);
    expect(service).toBeTruthy();
  });
});
