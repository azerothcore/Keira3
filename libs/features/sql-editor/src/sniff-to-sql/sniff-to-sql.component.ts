import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SessionSqlService } from '@keira/shared/common-services';
import { TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { TranslatePipe } from '@ngx-translate/core';
import { ClipboardService } from 'ngx-clipboard';
import { firstValueFrom } from 'rxjs';
import { escape } from 'sqlstring';
import { creatureTextSql, parseSniff, SniffPath, SniffText, waypointDataSql, waypointsSql } from './sniff';

export type SniffPathTable = 'waypoint_data' | 'waypoints';

/**
 * A parsed sniff (WowPacketParser's text output) pasted, written as SQL: the paths creatures walked as waypoint_data or
 * waypoints, and what they said as creature_text matched to broadcast_text.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sniff-to-sql',
  templateUrl: './sniff-to-sql.component.html',
  imports: [FormsModule, TranslatePipe],
})
export class SniffToSqlComponent {
  private readonly queryService = inject(MysqlQueryService);
  private readonly sessionSql = inject(SessionSqlService);
  private readonly clipboard = inject(ClipboardService);

  protected readonly text = signal('');
  protected readonly table = signal<SniffPathTable>('waypoint_data');
  protected readonly firstPathId = signal(1);
  protected readonly paths = signal<SniffPath[]>([]);
  protected readonly texts = signal<SniffText[]>([]);
  private readonly broadcast = signal<Map<string, number>>(new Map());
  private readonly firstGroups = signal<Map<number, number>>(new Map());
  protected readonly parsed = signal(false);
  protected readonly error = signal('');
  protected readonly added = signal(false);

  protected readonly sql = computed(() => {
    const write = this.table() === 'waypoint_data' ? waypointDataSql : waypointsSql;
    const paths = this.paths().map((path, i) => write(path, this.firstPathId() + i));
    const texts = this.texts().length ? [creatureTextSql(this.texts(), this.broadcast(), this.firstGroups())] : [];
    return [...paths, ...texts].join('\n');
  });

  protected async parse(): Promise<void> {
    const { paths, texts } = parseSniff(this.text());
    this.paths.set(paths);
    this.texts.set(texts);
    this.parsed.set(true);
    this.added.set(false);
    this.error.set('');
    try {
      await this.readDatabase(texts);
    } catch (error) {
      this.error.set((error as { sqlMessage?: string; message?: string })?.sqlMessage ?? (error as Error)?.message ?? String(error));
    }
  }

  /** The first free path id, the broadcast texts of what was said, and each creature's next free text group. */
  private async readDatabase(texts: SniffText[]): Promise<void> {
    const column = this.table() === 'waypoint_data' ? 'id' : 'entry';
    const [max] =
      (await firstValueFrom(this.queryService.query<TableRow>(`SELECT MAX(\`${column}\`) AS max FROM \`${this.table()}\``))) ?? [];
    this.firstPathId.set(Number(max?.['max'] ?? 0) + 1);
    if (!texts.length) {
      return;
    }
    const said = [...new Set(texts.map((line) => line.text))].map((line) => escape(line)).join(', ');
    const rows =
      (await firstValueFrom(
        this.queryService.query<{ ID: number; MaleText: string; FemaleText: string }>(
          `SELECT \`ID\`, \`MaleText\`, \`FemaleText\` FROM \`broadcast_text\` WHERE \`MaleText\` IN (${said}) OR \`FemaleText\` IN (${said})`,
        ),
      )) ?? [];
    const broadcast = new Map<string, number>();
    for (const row of rows) {
      [row.MaleText, row.FemaleText].filter(Boolean).forEach((line) => broadcast.has(line) || broadcast.set(line, Number(row.ID)));
    }
    this.broadcast.set(broadcast);
    const entries = [...new Set(texts.map((line) => line.entry))].join(', ');
    const groups =
      (await firstValueFrom(
        this.queryService.query<{ CreatureID: number; next: number }>(
          `SELECT \`CreatureID\`, MAX(\`GroupID\`) + 1 AS next FROM \`creature_text\` WHERE \`CreatureID\` IN (${entries}) GROUP BY \`CreatureID\``,
        ),
      )) ?? [];
    this.firstGroups.set(new Map(groups.map((row) => [Number(row.CreatureID), Number(row.next)])));
  }

  protected matched(): number {
    return this.texts().filter((line) => this.broadcast().has(line.text)).length;
  }

  protected copy(): void {
    this.clipboard.copyFromContent(this.sql());
  }

  protected addToSession(): void {
    this.sessionSql.add('sniff', this.sql());
    this.added.set(true);
  }
}
