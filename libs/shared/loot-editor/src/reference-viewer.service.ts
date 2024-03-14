import { Injectable } from '@angular/core';

import { ReferenceLootTemplate } from '@keira/shared/acore-world-model';
import { Observable } from 'rxjs';
import { MysqlQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class ReferenceViewerService {
  constructor(public queryService: MysqlQueryService) {}

  getReferenceById(referenceId: number): Observable<ReferenceLootTemplate[]> {
    return this.queryService.query<ReferenceLootTemplate>(`SELECT * FROM reference_loot_template WHERE Entry = ${referenceId}`);
  }
}
