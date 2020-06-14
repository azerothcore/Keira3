import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ReferenceViewerService } from './reference-viewer.service';
import { ReferenceViewerModule } from '@keira-shared/modules/reference-viewer/reference-viewer.module';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { ReferenceLootTemplate } from '@keira-types/reference-loot-template.type';
import { TableRow } from '@keira-types/general';

fdescribe('ReferenceViewerService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ReferenceViewerModule,
      ]
    });
  });

  const setup = () => {
    const service = TestBed.inject(ReferenceViewerService);
    const queryService = TestBed.inject(MysqlQueryService);
    return { service, queryService };
  };

  it('should be created', done => {
    const mockReferenceLoot: ReferenceLootTemplate[] = [new ReferenceLootTemplate()];
    const referenceId = 1234;
    const { service, queryService } = setup();
    const querySpy = spyOn(queryService, 'query');
    querySpy.and.returnValue(of(mockReferenceLoot as TableRow[]));

    service.getReferenceById(referenceId).subscribe((result) => {
      expect(result).toEqual(mockReferenceLoot);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith(
        `SELECT * FROM reference_loot_template WHERE Entry = ${referenceId}`
      );
      done();
    });
  });
});
