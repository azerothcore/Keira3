import { Injectable } from '@angular/core';

import { ReferenceLootTemplate } from '@keira/acore-world-model';
import { Observable } from 'rxjs';
import { MysqlQueryService } from '../../services/query/mysql-query.service';

@Injectable()
export class ReferenceViewerService {
  constructor(public queryService: MysqlQueryService) {}

  getReferenceById(referenceId: number): Observable<ReferenceLootTemplate[]> {
    return this.queryService.query<ReferenceLootTemplate>(`SELECT * FROM reference_loot_template WHERE Entry = ${referenceId}`);
  }
}
