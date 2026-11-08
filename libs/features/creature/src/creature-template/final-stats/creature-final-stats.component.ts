import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { TranslatePipe } from '@ngx-translate/core';
import { debounceTime, firstValueFrom, startWith } from 'rxjs';
import { FinalStats, finalStats, StatsTemplate } from './final-stats';

/** The creature's health, mana, armor and damage at its lowest and highest level, its modifiers applied (#3318). */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-final-stats',
  templateUrl: './creature-final-stats.component.html',
  imports: [TranslatePipe],
})
export class CreatureFinalStatsComponent implements OnInit {
  private readonly queryService = inject(MysqlQueryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = input.required<FormGroup>();

  protected readonly stats = signal<FinalStats[]>([]);
  protected readonly experience = signal(1);
  private request = 0;

  ngOnInit(): void {
    this.form()
      .valueChanges.pipe(startWith(null), debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => void this.read());
  }

  private async read(): Promise<void> {
    const request = ++this.request;
    const template = this.form().getRawValue() as StatsTemplate & { minlevel: number; maxlevel: number };
    const levels = [...new Set([Number(template.minlevel), Number(template.maxlevel)])].map((level) => Math.trunc(level) || 1);
    const rows =
      (await firstValueFrom(
        this.queryService.query<TableRow>(
          `SELECT * FROM \`creature_classlevelstats\` WHERE \`class\` = ${Math.trunc(Number(template.unit_class)) || 1} ` +
            `AND \`level\` IN (${levels.join(', ')}) ORDER BY \`level\``,
        ),
      ).catch(() => [])) ?? [];
    if (request === this.request) {
      this.stats.set(rows.map((row) => finalStats(row, template)));
      this.experience.set(Number(template.ExperienceModifier));
    }
  }
}
