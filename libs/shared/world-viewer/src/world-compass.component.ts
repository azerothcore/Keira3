import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/** The compass points, every 45° from north (their labels are translated: WORLD_EDITOR.COMPASS_N…). */
export const COMPASS_POINTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
/** NATO mils in a full turn. */
export const MILS_PER_TURN = 6400;

/** A bearing (degrees, clockwise from north) between 0 and 360. */
export const normaliseBearing = (degrees: number): number => ((degrees % 360) + 360) % 360;

/**
 * The view's compass: a dial marked every 5°, with a mark and its number every 45° (north red, the others orange) and
 * the compass points on an outer ring, turning so the
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
  /** 0.1 (barely there) .. 1 (solid). */
  readonly opacity = input(1);

  protected readonly bearing = computed(() => normaliseBearing(this.heading()));
  /** Rounded to the whole degree shown (360 shows as 0). */
  protected readonly wholeDegrees = computed(() => Math.round(this.bearing()) % 360);
  protected readonly wholeMils = computed(() => Math.round((this.bearing() * MILS_PER_TURN) / 360) % MILS_PER_TURN);
  protected readonly point = computed(() => COMPASS_POINTS[Math.round(this.bearing() / 45) % 8]);
  protected readonly dialRotation = computed(() => (this.northUp() ? 0 : -this.bearing()));
  /** Small ticks every 5°, but where the marks are. */
  protected readonly ticks = Array.from({ length: 72 }, (_, i) => i * 5).filter((angle) => angle % 45 !== 0);
  /** Every 45°: north a red arrow, east / south / west orange arrows, the ones between an orange dotted tick. */
  protected readonly marks = Array.from({ length: 8 }, (_, i) => i * 45).map((angle) => ({
    angle,
    kind: angle === 0 ? 'north' : angle % 90 === 0 ? 'arrow' : 'tick',
  }));
  /** The compass points on the outer ring. */
  protected readonly pointLabels = COMPASS_POINTS.map((point, i) => ({ angle: i * 45, point }));
}
