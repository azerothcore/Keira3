import { Injectable } from '@angular/core';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { ReferenceLootTemplate } from '@keira/acore-world-model';
import { Observable } from 'rxjs';

@Injectable()
export class ReferenceViewerService {
  constructor(public queryService: MysqlQueryService) {}

  getReferenceById(referenceId: number): Observable<ReferenceLootTemplate[]> {
    return this.queryService.query<ReferenceLootTemplate>(`SELECT * FROM reference_loot_template WHERE Entry = ${referenceId}`);
  }
}
