import { PoolProblem } from '@keira/shared/utils';
import { ChangeDetectionStrategy, Component, computed, effect, inject, untracked } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PoolQuest } from '@keira/shared/acore-world-model';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TableRow } from '@keira/shared/constants';
import { QuestSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { Lookup } from '../lookup';
import { PoolMembersComponent } from '../pool-members.component';
import { PoolQuestService } from './pool-quest.service';

/** quest_template.Flags: QUEST_FLAGS_DAILY and QUEST_FLAGS_WEEKLY. */
export const QUEST_FLAG_DAILY = 0x1000;
export const QUEST_FLAG_WEEKLY = 0x8000;

/**
 * Pool Editor > quests: the daily or weekly quests offered in turn (`pool_quest`), and what the world server would
 * refuse (quests that aren't daily or weekly, dailies mixed with weeklies, quests in another pool, a quest pool inside
 * a mother pool).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-pool-quest',
  templateUrl: './pool-quest.component.html',
  imports: [
    TopBarComponent,
    TranslateDirective,
    TranslatePipe,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    EditorButtonsComponent,
    NgxDatatableModule,
    QuestSelectorBtnComponent,
  ],
})
export class PoolQuestComponent extends PoolMembersComponent<PoolQuest> {
  protected override readonly editorService = inject(PoolQuestService);
  private readonly query = (sql: string) => this.editorService.queryService.query<TableRow>(sql);
  private readonly quests = new Lookup(
    this.query,
    (ids) => `SELECT ID AS id, LogTitle AS name, Flags FROM quest_template WHERE ID IN (${ids})`,
  );
  private readonly otherPools = new Lookup(
    this.query,
    (ids) =>
      `SELECT entry AS id, pool_entry FROM pool_quest WHERE entry IN (${ids}) ` +
      `AND pool_entry <> ${Math.trunc(Number(this.handlerService.selected))}`,
  );

  constructor() {
    super();
    effect(() => {
      const ids = this.editorService.rows().map((row) => Number(row.entry));
      untracked(() => this.keep(this.quests.need(ids), this.otherPools.need(ids)));
    });
  }

  protected readonly problems = computed<PoolProblem[]>(() => {
    const rows = this.editorService.rows();
    const problems = this.chanceChecks(undefined);
    const mother = this.mother();
    if (rows.length && mother !== null) {
      problems.push({ key: 'QUEST_IN_MOTHER', params: { mother } });
    }
    const missing = rows.filter((row) => this.quests.get(row.entry) === null).map((row) => row.entry);
    if (missing.length) {
      problems.push({ key: 'MISSING_QUEST', params: { ids: missing.join(', ') } });
    }
    const flags = rows.map((row) => this.quests.get(row.entry)).filter((quest): quest is TableRow => !!quest);
    const daily = flags.filter((quest) => Number(quest['Flags']) & QUEST_FLAG_DAILY);
    const weekly = flags.filter((quest) => Number(quest['Flags']) & QUEST_FLAG_WEEKLY);
    const neither = flags.filter((quest) => !(Number(quest['Flags']) & (QUEST_FLAG_DAILY | QUEST_FLAG_WEEKLY)));
    if (neither.length) {
      problems.push({ key: 'QUEST_NOT_REPEATING', params: { ids: neither.map((quest) => quest['id']).join(', ') } });
    }
    if (daily.length && weekly.length) {
      problems.push({ key: 'QUEST_MIXED' });
    }
    const elsewhere = rows.filter((row) => this.otherPools.get(row.entry));
    if (elsewhere.length) {
      const list = elsewhere.map((row) => `${row.entry} (${this.otherPools.get(row.entry)?.['pool_entry']})`).join(', ');
      problems.push({ key: 'OTHER_POOL', params: { list } });
    }
    return problems;
  });

  protected questName(id: number): string {
    return String(this.quests.get(id)?.['name'] ?? '');
  }
}
