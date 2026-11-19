import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/** What the World Editor reads from, lit when there: the database, the game client, the AzerothCore source. */
export interface EdenLights {
  database: boolean;
  gameData: boolean;
  source: boolean;
}

/** The World Editor's status bar (Eden Editor's): where the camera is, the map and zone, the pending changes, what it reads. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-eden-status-bar',
  imports: [TranslatePipe],
  template: `
    <div class="eden-status-bar d-flex flex-wrap align-items-center gap-3 small" data-testid="eden-status-bar">
      <span data-testid="eden-status-position">
        @if (position(); as p) {
          X {{ p.x.toFixed(1) }} · Y {{ p.y.toFixed(1) }} · Z {{ p.z.toFixed(1) }}
        } @else {
          -
        }
      </span>
      <span data-testid="eden-status-cursor" [title]="'WORLD_EDITOR.EDEN.CURSOR' | translate">
        <i class="fa fa-mouse-pointer"></i>
        @if (cursor(); as c) {
          X {{ c.position.x.toFixed(1) }} · Y {{ c.position.y.toFixed(1) }} · Z {{ c.position.z.toFixed(1) }} · {{ c.distance.toFixed(0) }} yd
        } @else {
          -
        }
      </span>
      <span data-testid="eden-status-place">{{ mapName() }}{{ zoneName() ? ' · ' + zoneName() : '' }}</span>
      <span data-testid="eden-status-pending" [class.text-warning]="pending() > 0">
        {{ 'WORLD_EDITOR.EDEN.PENDING' | translate: { count: pending() } }}
      </span>
      <span class="ms-auto d-flex gap-2">
        @for (light of LIGHTS; track light.key) {
          <span [attr.data-testid]="'eden-light-' + light.key" [class.lit]="lights()[light.key]" [title]="light.label | translate">
            <i class="fas fa-circle eden-light"></i> {{ light.label | translate }}
          </span>
        }
      </span>
    </div>
  `,
  styles: `
    .eden-status-bar {
      border-top: 1px solid var(--bs-border-color, #444);
      padding: 2px 6px;
      margin-top: 4px;
      font-family: monospace;
    }
    .eden-light {
      font-size: 8px;
      color: var(--bs-secondary-color, #888);
    }
    .lit .eden-light {
      color: var(--bs-success, #198754);
    }
  `,
})
export class EdenStatusBarComponent {
  readonly position = input<{ x: number; y: number; z: number } | undefined>(undefined);
  /** The ground under the cursor (Eden's status bar), and how far it is from the camera. */
  readonly cursor = input<{ position: { x: number; y: number; z: number }; distance: number } | undefined>(undefined);
  readonly mapName = input('');
  readonly zoneName = input('');
  readonly pending = input(0);
  readonly lights = input<EdenLights>({ database: false, gameData: false, source: false });

  protected readonly LIGHTS: { key: keyof EdenLights; label: string }[] = [
    { key: 'database', label: 'WORLD_EDITOR.EDEN.LIGHT_DATABASE' },
    { key: 'gameData', label: 'WORLD_EDITOR.EDEN.LIGHT_GAME_DATA' },
    { key: 'source', label: 'WORLD_EDITOR.EDEN.LIGHT_SOURCE' },
  ];
}
