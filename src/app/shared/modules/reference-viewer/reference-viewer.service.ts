import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { ReferenceLootTemplate } from '@keira-types/reference-loot-template.type';

@Injectable()
export class ReferenceViewerService {

  constructor(public queryService: MysqlQueryService) {}

  getReferenceById(referenceId: number): Observable<ReferenceLootTemplate[]> {
    return this.queryService.query<ReferenceLootTemplate>(
      `SELECT * FROM reference_loot WHERE Entry = ${referenceId}`
    );
  }
}
