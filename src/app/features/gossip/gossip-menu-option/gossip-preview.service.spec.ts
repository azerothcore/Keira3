import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { MockedToastrService } from '@keira-shared/testing/mocks';
import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { GossipPreviewService } from './gossip-preview.service';

describe('GossipPreviewService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: ToastrService, useValue: instance(MockedToastrService) },
    ]
  }));

    let service: GossipPreviewService;
    let sqliteQueryService: SqliteQueryService;
    let mysqlQueryService: MysqlQueryService;

    beforeEach(() => {
      mysqlQueryService = TestBed.inject(MysqlQueryService);


      service = TestBed.inject(GossipPreviewService);
    });

    it('getItemExtendedCostFromVendor', () => {
      service['getItemExtendedCostFromVendor'](123);
      expect(mysqlQueryService.query).toHaveBeenCalledTimes(1);
    });

});
