import { ChangeDetectionStrategy, Component, computed, inject, input, OnChanges, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SessionSqlService } from '@keira/shared/common-services';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { CHAIN_LINK_FIELDS, ChainLinkField, ChainLinks, chainLinksQuery, NO_CHAIN_LINKS } from './quest-chain-links';

/**
 * The chain links of one quest of the chain (quest_template_addon PrevQuestID, NextQuestID, ExclusiveGroup,
 * BreadcrumbForQuestId), changed from the chain itself: the SQL shown, executed or kept in the session.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-quest-chain-links',
  imports: [FormsModule, TranslatePipe],
  template: `
    <div class="content-block" id="quest-chain-links">
      <span class="category-title">{{ 'QUEST.CHAIN.LINKS_TITLE' | translate: { id: questId(), title: title() ?? '' } }}</span>
      <p class="small text-muted mb-2">{{ 'QUEST.CHAIN.LINKS_HELP' | translate }}</p>
      <div class="row">
        @for (field of FIELDS; track field) {
          <div class="form-group col-6 col-md-3">
            <label class="control-label" [for]="'link-' + field">{{ field }}</label>
            <input
              type="number"
              class="form-control form-control-sm"
              [id]="'link-' + field"
              [ngModel]="links()[field]"
              (ngModelChange)="change(field, $event)"
            />
          </div>
        }
      </div>
      @if (query()) {
        <pre class="small p-2 rounded mt-2" id="quest-chain-links-query" style="background: var(--keira-code-bg)">{{ query() }}</pre>
      }
      @if (error()) {
        <p class="text-danger small" id="quest-chain-links-error">{{ error() }}</p>
      }
      <div class="d-flex gap-2">
        <button
          type="button"
          class="btn btn-primary btn-sm"
          id="quest-chain-links-execute"
          [disabled]="!query() || busy()"
          (click)="execute()"
        >
          <i class="fa fa-bolt fa-sm"></i> {{ 'COPY_OUTPUT.EXECUTE' | translate }}
        </button>
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          id="quest-chain-links-session"
          [disabled]="!query()"
          (click)="addToSession()"
        >
          <i class="fa fa-layer-group fa-sm"></i> {{ 'SESSION_SQL.ADD' | translate }}
        </button>
        <button type="button" class="btn btn-outline-secondary btn-sm" id="quest-chain-links-reset" [disabled]="!query()" (click)="reset()">
          {{ 'QUEST.CHAIN.LINKS_RESET' | translate }}
        </button>
      </div>
    </div>
  `,
})
export class QuestChainLinksComponent implements OnChanges {
  private readonly queryService = inject(MysqlQueryService);
  private readonly sessionSql = inject(SessionSqlService);

  readonly questId = input.required<number>();
  readonly title = input<string | undefined>('');
  /** The links were written: the chain is drawn again. */
  readonly changed = output<void>();

  protected readonly FIELDS = CHAIN_LINK_FIELDS;
  private readonly saved = signal<ChainLinks>({ ...NO_CHAIN_LINKS });
  protected readonly links = signal<ChainLinks>({ ...NO_CHAIN_LINKS });
  protected readonly error = signal('');
  protected readonly busy = signal(false);
  protected readonly query = computed(() => chainLinksQuery(this.questId(), this.saved(), this.links()));

  ngOnChanges(): void {
    void this.read();
  }

  private async read(): Promise<void> {
    const id = this.questId();
    this.error.set('');
    try {
      const [row] =
        (await firstValueFrom(
          this.queryService.query<ChainLinks>(
            `SELECT ${CHAIN_LINK_FIELDS.map((field) => `\`${field}\``).join(', ')} FROM \`quest_template_addon\` WHERE \`ID\` = ${Math.trunc(id)}`,
          ),
        )) ?? [];
      if (id !== this.questId()) {
        return;
      }
      const links = { ...NO_CHAIN_LINKS, ...(row ?? {}) };
      this.saved.set(links);
      this.links.set({ ...links });
    } catch (error) {
      this.error.set(this.message(error));
    }
  }

  protected change(field: ChainLinkField, value: number | null): void {
    this.links.set({ ...this.links(), [field]: Number(value) || 0 });
  }

  protected reset(): void {
    this.links.set({ ...this.saved() });
  }

  protected async execute(): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    try {
      await firstValueFrom(this.queryService.query(this.query()));
      this.saved.set({ ...this.links() });
      this.changed.emit();
    } catch (error) {
      this.error.set(this.message(error));
    }
    this.busy.set(false);
  }

  protected addToSession(): void {
    this.sessionSql.add(`quest_template_addon ${this.questId()}`, this.query());
  }

  private message(error: unknown): string {
    return (error as { sqlMessage?: string; message?: string })?.sqlMessage ?? (error as Error)?.message ?? String(error);
  }
}
