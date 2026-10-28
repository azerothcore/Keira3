import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/** The compass points, every 45° from north (their labels are translated: WORLD_EDITOR.COMPASS_N…). */
export const COMPASS_POINTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
/** NATO mils in a full turn. */
export const MILS_PER_TURN = 6400;

/** A bearing (degrees, clockwise from north) between 0 and 360. */
export const normaliseBearing = (degrees: number): number => ((degrees % 360) + 360) % 360;

/**
 * The view's compass: a dial marked every 5°, numbered every 15°, with the compass points every 45°, turning so the
 * way the camera looks is at the top (or fixed with north up and a needle turning instead), and the bearing in degrees
 * and/or mils under it.
 */
@Component({
  selector: 'keira-world-compass',
  templateUrl: './world-compass.component.html',
  styleUrl: './world-compass.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
})
export class WorldCompassComponent {
  /** Where the camera looks: degrees clockwise from north. */
  readonly heading = input.required<number>();
  /** Keep north at the top and turn a needle instead of the dial. */
  readonly northUp = input(false);
  readonly northArrow = input(true);
  readonly points = input(true);
  readonly degrees = input(true);
  readonly mils = input(false);

  protected readonly bearing = computed(() => normaliseBearing(this.heading()));
  /** Rounded to the whole degree shown (360 shows as 0). */
  protected readonly wholeDegrees = computed(() => Math.round(this.bearing()) % 360);
  protected readonly wholeMils = computed(() => Math.round((this.bearing() * MILS_PER_TURN) / 360) % MILS_PER_TURN);
  protected readonly point = computed(() => COMPASS_POINTS[Math.round(this.bearing() / 45) % 8]);
  protected readonly dialRotation = computed(() => (this.northUp() ? 0 : -this.bearing()));
  protected readonly ticks = Array.from({ length: 72 }, (_, i) => i * 5);
  /** Every 15°: a compass point every 45°, otherwise the number. */
  protected readonly labels = Array.from({ length: 24 }, (_, i) => i * 15).map((angle) => ({
    angle,
    point: angle % 45 === 0 ? COMPASS_POINTS[angle / 45] : undefined,
  }));
}
