import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DEFAULT_WORLD_STYLE, MARKER_SHAPES, MarkerShape, StyleColor, WorldStyle, WorldStyleService } from '@keira/shared/world-viewer';
import { TranslatePipe } from '@ngx-translate/core';

/** A colour the panel offers, by its key in the style, under a heading. */
type ColorKey = { [K in keyof WorldStyle]: WorldStyle[K] extends StyleColor ? K : never }[keyof WorldStyle];

/** The colours, by group, in the order shown. */
export const STYLE_GROUPS: { title: string; colors: { key: ColorKey; label: string; shape?: 'creatureShape' | 'gameobjectShape' }[] }[] = [
  {
    title: 'WORLD_EDITOR.STYLE_SPAWNS',
    colors: [
      { key: 'creature', label: 'WORLD_EDITOR.CREATURES', shape: 'creatureShape' },
      { key: 'gameobject', label: 'WORLD_EDITOR.GAMEOBJECTS', shape: 'gameobjectShape' },
      { key: 'selected', label: 'WORLD_EDITOR.STYLE_SELECTED' },
    ],
  },
  {
    title: 'WORLD_EDITOR.STYLE_CIRCLES',
    colors: [
      { key: 'wander', label: 'WORLD_EDITOR.STYLE_WANDER' },
      { key: 'bounds', label: 'WORLD_EDITOR.STYLE_BOUNDS' },
      { key: 'reach', label: 'WORLD_EDITOR.STYLE_REACH' },
      { key: 'aggro', label: 'WORLD_EDITOR.STYLE_AGGRO' },
      { key: 'assist', label: 'WORLD_EDITOR.STYLE_ASSIST' },
      { key: 'areaTrigger', label: 'WORLD_EDITOR.STYLE_AREA_TRIGGERS' },
    ],
  },
  {
    title: 'WORLD_EDITOR.STYLE_LINES',
    colors: [
      { key: 'formation', label: 'WORLD_EDITOR.STYLE_FORMATION' },
      { key: 'pathStart', label: 'WORLD_EDITOR.STYLE_PATH_START' },
      { key: 'tag', label: 'WORLD_EDITOR.STYLE_TAG' },
    ],
  },
  {
    title: 'WORLD_EDITOR.STYLE_SIMULATION',
    colors: [
      { key: 'simulationDone', label: 'WORLD_EDITOR.STYLE_SIM_DONE' },
      { key: 'simulationDetour', label: 'WORLD_EDITOR.STYLE_SIM_DETOUR' },
      { key: 'simulationStuck', label: 'WORLD_EDITOR.STYLE_SIM_STUCK' },
      { key: 'simulationCurrent', label: 'WORLD_EDITOR.STYLE_SIM_CURRENT' },
      { key: 'simulationNext', label: 'WORLD_EDITOR.STYLE_SIM_NEXT' },
    ],
  },
  {
    title: 'WORLD_EDITOR.STYLE_PROBE',
    colors: [
      { key: 'probePath', label: 'WORLD_EDITOR.STYLE_PROBE_PATH' },
      { key: 'probeClear', label: 'WORLD_EDITOR.STYLE_PROBE_CLEAR' },
      { key: 'probeBlocked', label: 'WORLD_EDITOR.STYLE_PROBE_BLOCKED' },
    ],
  },
];

/**
 * View > Colours and shapes: every colour the view draws with (and how solid), the shapes of the pins and waypoints,
 * each with its default to go back to. Kept on this computer.
 */
@Component({
  selector: 'keira-style-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    @let style = styles.style();
    <div class="card card-body py-2 world-editor-style" data-testid="style-panel">
      <div class="d-flex align-items-center gap-2 mb-1">
        <strong class="flex-grow-1">{{ 'WORLD_EDITOR.STYLE' | translate }}</strong>
        <button type="button" class="btn btn-sm btn-outline-secondary" data-testid="style-reset-all" (click)="styles.reset()">
          <i class="fa fa-undo"></i> {{ 'WORLD_EDITOR.STYLE_RESET_ALL' | translate }}
        </button>
      </div>
      <div class="world-editor-style-columns">
        @for (group of groups; track group.title) {
          <section class="world-editor-style-group">
            <h6 class="world-editor-view-group-title">{{ group.title | translate }}</h6>
            @for (item of group.colors; track item.key) {
              <div class="world-editor-style-row" [attr.data-testid]="'style-' + item.key">
                <span class="world-editor-style-label">{{ item.label | translate }}</span>
                <input
                  type="color"
                  class="form-control form-control-color form-control-sm"
                  [attr.data-testid]="'style-color-' + item.key"
                  [value]="style[item.key].color"
                  [attr.aria-label]="item.label | translate"
                  (input)="setColor(item.key, $event)"
                />
                <input
                  type="range"
                  class="form-range"
                  min="0"
                  max="100"
                  step="5"
                  [attr.data-testid]="'style-opacity-' + item.key"
                  [value]="round(style[item.key].opacity * 100)"
                  [title]="'WORLD_EDITOR.STYLE_OPACITY' | translate"
                  (input)="setOpacity(item.key, $event)"
                />
                <span class="world-editor-style-value">{{ round(style[item.key].opacity * 100) }}%</span>
                @if (item.shape; as shape) {
                  <select
                    class="form-select form-select-sm w-auto"
                    [attr.data-testid]="'style-shape-' + item.key"
                    (change)="setShape(shape, $event)"
                  >
                    @for (option of shapes; track option) {
                      <option [value]="option" [selected]="style[shape] === option">
                        {{ 'WORLD_EDITOR.SHAPE_' + option.toUpperCase() | translate }}
                      </option>
                    }
                  </select>
                }
                <button
                  type="button"
                  class="btn btn-sm btn-link p-0"
                  [attr.data-testid]="'style-reset-' + item.key"
                  [class.invisible]="isDefault(item.key) && (!item.shape || isDefault(item.shape))"
                  [title]="'WORLD_EDITOR.STYLE_RESET' | translate"
                  (click)="reset(item.key, item.shape)"
                >
                  <i class="fa fa-undo"></i>
                </button>
              </div>
            }
          </section>
        }
        <section class="world-editor-style-group">
          <h6 class="world-editor-view-group-title">{{ 'WORLD_EDITOR.WAYPOINTS' | translate }}</h6>
          <div class="world-editor-style-row">
            <span class="world-editor-style-label">{{ 'WORLD_EDITOR.STYLE_SHAPE' | translate }}</span>
            <select
              class="form-select form-select-sm w-auto"
              data-testid="style-shape-waypoint"
              (change)="setShape('waypointShape', $event)"
            >
              @for (option of shapes; track option) {
                <option [value]="option" [selected]="style.waypointShape === option">
                  {{ 'WORLD_EDITOR.SHAPE_' + option.toUpperCase() | translate }}
                </option>
              }
            </select>
          </div>
          <div class="world-editor-style-row">
            <span class="world-editor-style-label">{{ 'WORLD_EDITOR.STYLE_SIZE' | translate }}</span>
            <input
              type="range"
              class="form-range"
              min="50"
              max="250"
              step="10"
              data-testid="style-waypoint-size"
              [value]="round(style.waypointSize * 100)"
              (input)="setNumber('waypointSize', $event)"
            />
            <span class="world-editor-style-value">{{ round(style.waypointSize * 100) }}%</span>
          </div>
          <div class="world-editor-style-row">
            <span class="world-editor-style-label">{{ 'WORLD_EDITOR.STYLE_PATH_COLORS' | translate }}</span>
            <span class="d-flex flex-wrap gap-1">
              @for (color of style.pathColors; track $index) {
                <input
                  type="color"
                  class="form-control form-control-color form-control-sm world-editor-style-swatch"
                  [attr.data-testid]="'style-path-color-' + $index"
                  [value]="color"
                  (input)="setPathColor($index, $event)"
                />
              }
            </span>
          </div>
          <div class="world-editor-style-row">
            <span class="world-editor-style-label">{{ 'WORLD_EDITOR.STYLE_PATH_OPACITY' | translate }}</span>
            <input
              type="range"
              class="form-range"
              min="10"
              max="100"
              step="5"
              data-testid="style-path-opacity"
              [value]="round(style.pathOpacity * 100)"
              (input)="setNumber('pathOpacity', $event)"
            />
            <span class="world-editor-style-value">{{ round(style.pathOpacity * 100) }}%</span>
          </div>
          <button type="button" class="btn btn-sm btn-link p-0" data-testid="style-reset-waypoints" (click)="resetWaypoints()">
            <i class="fa fa-undo"></i> {{ 'WORLD_EDITOR.STYLE_RESET' | translate }}
          </button>
        </section>
      </div>
      <small class="text-muted">{{ 'WORLD_EDITOR.STYLE_LINES_NOTE' | translate }}</small>
    </div>
  `,
  styles: `
    .world-editor-style {
      max-height: 70vh;
      overflow: hidden auto;
    }
    .world-editor-style-columns {
      column-width: 300px;
      column-gap: 1.5rem;
    }
    .world-editor-style-group {
      margin-bottom: 0.5rem;
    }
    .world-editor-style-group > * {
      break-inside: avoid;
    }
    .world-editor-view-group-title {
      margin: 0 0 0.15rem;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      opacity: 0.7;
      break-after: avoid;
    }
    .world-editor-style-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-bottom: 0.25rem;
    }
    .world-editor-style-label {
      flex: 0 0 9.5rem;
      min-width: 0;
      overflow-wrap: anywhere;
      line-height: 1.2;
    }
    .world-editor-style-row .form-range {
      flex: 1 1 auto;
      min-width: 4rem;
    }
    .world-editor-style-value {
      flex: 0 0 2.6rem;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
    .form-control-color {
      flex: 0 0 auto;
      width: 2rem;
      height: 1.6rem;
      padding: 0.1rem;
    }
    .world-editor-style-swatch {
      width: 1.6rem;
    }
  `,
})
export class StylePanelComponent {
  protected readonly styles = inject(WorldStyleService);
  protected readonly groups = STYLE_GROUPS;
  protected readonly shapes = MARKER_SHAPES;
  protected readonly round = Math.round;

  protected setColor(key: ColorKey, event: Event): void {
    this.styles.update({ [key]: { ...this.styles.style()[key], color: (event.target as HTMLInputElement).value } });
  }

  protected setOpacity(key: ColorKey, event: Event): void {
    this.styles.update({ [key]: { ...this.styles.style()[key], opacity: Number((event.target as HTMLInputElement).value) / 100 } });
  }

  protected setShape(key: 'creatureShape' | 'gameobjectShape' | 'waypointShape', event: Event): void {
    this.styles.update({ [key]: (event.target as HTMLSelectElement).value as MarkerShape });
  }

  /** A slider in percent, to its fraction. */
  protected setNumber(key: 'waypointSize' | 'pathOpacity', event: Event): void {
    this.styles.update({ [key]: Number((event.target as HTMLInputElement).value) / 100 });
  }

  protected setPathColor(index: number, event: Event): void {
    const pathColors = [...this.styles.style().pathColors];
    pathColors[index] = (event.target as HTMLInputElement).value;
    this.styles.update({ pathColors });
  }

  protected isDefault(key: keyof WorldStyle): boolean {
    return JSON.stringify(this.styles.style()[key]) === JSON.stringify(DEFAULT_WORLD_STYLE[key]);
  }

  protected reset(key: ColorKey, shape?: 'creatureShape' | 'gameobjectShape'): void {
    this.styles.update({ [key]: DEFAULT_WORLD_STYLE[key], ...(shape ? { [shape]: DEFAULT_WORLD_STYLE[shape] } : {}) });
  }

  protected resetWaypoints(): void {
    const { waypointShape, waypointSize, pathColors, pathOpacity } = DEFAULT_WORLD_STYLE;
    this.styles.update({ waypointShape, waypointSize, pathColors, pathOpacity });
  }
}
