import { Injectable } from '@angular/core';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { ReferenceLootTemplate } from '@keira-types/reference-loot-template.type';
import { Observable } from 'rxjs';

@Injectable()
export class ReferenceViewerService {
  constructor(public queryService: MysqlQueryService) {}

  getReferenceById(referenceId: number): Observable<ReferenceLootTemplate[]> {
    return this.queryService.query<ReferenceLootTemplate>(`SELECT * FROM reference_loot_template WHERE Entry = ${referenceId}`);
  }
}
