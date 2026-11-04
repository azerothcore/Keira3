import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { QuestTemplate } from '@keira/shared/acore-world-model';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { ModelForm } from '@keira/shared/utils';
import { TranslatePipe } from '@ngx-translate/core';
import { debounceTime, firstValueFrom, startWith } from 'rxjs';
import { checkQuestTemplate, QuestProblem, questReferences } from './quest-checks';

export const QUEST_CHECKS_DELAY = 300;

/** What AzerothCore would complain about in the quest as edited: its fields, and the ids it uses that don't exist. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-quest-checks',
  imports: [TranslatePipe],
  template: `
    @if (problems().length) {
      <div class="content-block" id="quest-checks">
        @for (problem of problems(); track problem.key) {
          <div class="alert alert-warning py-1 px-2 small mb-1" [id]="'quest-check-' + problem.key">
            <i class="fas fa-exclamation-triangle me-1"></i>{{ 'QUEST.CHECK.' + problem.key | translate }}
            <span class="text-muted">({{ problem.fields.join(', ') }})</span>
          </div>
        }
      </div>
    }
  `,
})
export class QuestChecksComponent implements OnInit {
  private readonly queryService = inject(MysqlQueryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = input.required<FormGroup<ModelForm<QuestTemplate>>>();
  protected readonly problems = signal<QuestProblem[]>([]);
  private generation = 0;

  ngOnInit(): void {
    const form = this.form();
    form.valueChanges
      .pipe(startWith(null), debounceTime(QUEST_CHECKS_DELAY), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => void this.check(form.getRawValue() as QuestTemplate));
  }

  private async check(quest: QuestTemplate): Promise<void> {
    const generation = ++this.generation;
    const local = checkQuestTemplate(quest);
    const missing = await this.missing(quest);
    if (generation === this.generation) {
      this.problems.set([...local, ...missing]);
    }
  }

  /** The ids used that are in none of their tables (nothing said when the database can't be read). */
  private async missing(quest: QuestTemplate): Promise<QuestProblem[]> {
    const { items, creatures, gameobjects, quests } = questReferences(quest);
    const lookups: [string, number[], string, string][] = [
      ['MISSING_ITEM', items, 'item_template', 'entry'],
      ['MISSING_CREATURE', creatures, 'creature_template', 'entry'],
      ['MISSING_GAMEOBJECT', gameobjects, 'gameobject_template', 'entry'],
      ['MISSING_QUEST', quests, 'quest_template', 'ID'],
    ];
    const problems: QuestProblem[] = [];
    for (const [key, ids, table, column] of lookups) {
      if (!ids.length) {
        continue;
      }
      try {
        const rows = await firstValueFrom(
          this.queryService.query<{ id: number }>(
            `SELECT \`${column}\` AS id FROM \`${table}\` WHERE \`${column}\` IN (${ids.join(', ')})`,
          ),
        );
        const found = new Set((rows ?? []).map((row) => Number(row.id)));
        const absent = ids.filter((id) => !found.has(id));
        if (absent.length) {
          problems.push({ key, fields: absent.map(String) });
        }
      } catch {
        // (the checks are an aid: no word when the database can't answer)
      }
    }
    return problems;
  }
}
