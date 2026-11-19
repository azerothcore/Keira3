import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HighlightjsWrapperComponent, QueryErrorComponent } from '@keira/shared/base-editor-components';
import { SessionSqlService } from '@keira/shared/common-services';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { TranslatePipe } from '@ngx-translate/core';
import { QueryError } from 'mysql2';
import { ClipboardService } from 'ngx-clipboard';
import { firstValueFrom } from 'rxjs';

/** The name of a session's .sql file: `keira-session-2026-11-04.sql`. */
export const sessionFileName = (date = new Date()): string => `keira-session-${date.toISOString().slice(0, 10)}.sql`;

/**
 * The queries put aside from the editors this session (#1086, #401): reorder or drop them, then copy them, save them
 * as one .sql file, or execute them all.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-session-sql',
  templateUrl: './session-sql.component.html',
  imports: [TranslatePipe, HighlightjsWrapperComponent, QueryErrorComponent],
})
export class SessionSqlComponent {
  protected readonly session = inject(SessionSqlService);
  private readonly clipboard = inject(ClipboardService);
  private readonly queryService = inject(MysqlQueryService);

  protected readonly error = signal<QueryError | undefined>(undefined);
  protected readonly executed = signal(false);
  protected readonly executing = signal(false);

  protected copy(): void {
    this.clipboard.copyFromContent(this.session.combined());
  }

  /** Downloads the session's SQL as a file. */
  protected save(): void {
    const url = URL.createObjectURL(new Blob([this.session.combined()], { type: 'application/sql' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = sessionFileName();
    link.click();
    URL.revokeObjectURL(url);
  }

  protected async execute(): Promise<void> {
    this.executing.set(true);
    this.error.set(undefined);
    this.executed.set(false);
    try {
      await firstValueFrom(this.queryService.query(this.session.combined()));
      this.executed.set(true);
    } catch (error) {
      this.error.set(error as QueryError);
    } finally {
      this.executing.set(false);
    }
  }

  protected clear(): void {
    this.session.clear();
    this.executed.set(false);
    this.error.set(undefined);
  }
}
