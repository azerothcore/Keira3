import { TestBed } from '@angular/core/testing';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { TableRow } from '@keira-types/general';
import { ReferenceLootTemplate } from '@keira-types/reference-loot-template.type';
import { of } from 'rxjs';
import { ReferenceViewerService } from './reference-viewer.service';

describe('ReferenceViewerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LootEditorModule],
    });
  });

  const setup = () => {
    const service = TestBed.inject(ReferenceViewerService);
    const queryService = TestBed.inject(MysqlQueryService);
    return { service, queryService };
  };

  it('should be created', (done) => {
    const mockReferenceLoot: ReferenceLootTemplate[] = [new ReferenceLootTemplate()];
    const referenceId = 1234;
    const { service, queryService } = setup();
    const querySpy = spyOn(queryService, 'query');
    querySpy.and.returnValue(of(mockReferenceLoot as TableRow[]));

    service.getReferenceById(referenceId).subscribe((result) => {
      expect(result).toEqual(mockReferenceLoot);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith(`SELECT * FROM reference_loot_template WHERE Entry = ${referenceId}`);
      done();
    });
  });
});
