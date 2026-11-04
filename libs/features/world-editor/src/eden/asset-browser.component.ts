import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CREATURE_TYPE, GAMEOBJECT_TYPE } from '@keira/shared/acore-world-model';
import { Option } from '@keira/shared/constants';
import { TranslatePipe } from '@ngx-translate/core';
import { debounceTime, merge } from 'rxjs';
import { PlaceTemplate, SpawnType } from '../world-editor.model';
import { WorldEditorService } from '../world-editor.service';

export const ASSET_SEARCH_DELAY = 300;
export const RECENT_ASSETS_KEY = 'keira3.worldEditor.recentAssets';
const RECENT_KEPT = 10;

/** A template picked to place, of a kind. */
export interface AssetPick {
  type: SpawnType;
  template: PlaceTemplate;
}

type Recent = Record<SpawnType, PlaceTemplate[]>;

function loadRecent(): Recent {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_ASSETS_KEY) ?? '{}') as Partial<Recent>;
    return { creature: stored.creature ?? [], gameobject: stored.gameobject ?? [] };
  } catch {
    return { creature: [], gameobject: [] };
  }
}

/**
 * The World Editor's Asset browser (Eden Editor's): the creature and gameobject templates by type, searched, recently
 * used first, picked to place with a click in the view.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-asset-browser',
  imports: [ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="asset-browser d-flex flex-column" data-testid="asset-browser">
      <div class="btn-group btn-group-sm mb-1">
        @for (option of MODES; track option.type; let i = $index) {
          <button
            type="button"
            class="btn"
            [attr.data-testid]="'asset-mode-' + option.type"
            [class.btn-secondary]="mode() === option.type"
            [class.btn-outline-secondary]="mode() !== option.type"
            [title]="'F' + (i + 1)"
            (click)="setMode(option.type)"
          >
            <i class="fa" [class]="option.icon"></i> {{ option.label | translate }}
          </button>
        }
      </div>
      <select class="form-select form-select-sm mb-1" data-testid="asset-group" [formControl]="group">
        <option [ngValue]="null">{{ 'WORLD_EDITOR.EDEN.ALL_TYPES' | translate }}</option>
        @for (option of groups(); track option.value) {
          <option [ngValue]="option.value">{{ option.value }} - {{ option.name }}</option>
        }
      </select>
      <input
        class="form-control form-control-sm mb-1"
        data-testid="asset-search"
        [placeholder]="'WORLD_EDITOR.EDEN.SEARCH' | translate"
        [formControl]="search"
      />

      <div class="asset-list flex-grow-1">
        @if (recent()[mode()].length) {
          <div class="asset-group-title">{{ 'WORLD_EDITOR.EDEN.RECENT' | translate }}</div>
          @for (template of recent()[mode()]; track template.entry) {
            <button type="button" class="asset-item" [attr.data-testid]="'asset-recent-' + template.entry" (click)="pick(template)">
              <i class="fa" [class]="mode() === 'creature' ? 'fa-dragon' : 'fa-cube'"></i> {{ template.name || '?' }}
              <span class="text-muted">{{ template.entry }}</span>
            </button>
          }
        }
        @if (loading()) {
          <div class="text-muted small p-1">{{ 'LOADING' | translate }}</div>
        }
        @for (section of sections(); track section.group) {
          <details [open]="sections().length === 1" [attr.data-testid]="'asset-section-' + section.group">
            <summary class="asset-group-title">{{ section.name }} ({{ section.templates.length }})</summary>
            @for (template of section.templates; track template.entry) {
              <button type="button" class="asset-item" [attr.data-testid]="'asset-' + template.entry" (click)="pick(template)">
                <i class="fa" [class]="mode() === 'creature' ? 'fa-dragon' : 'fa-cube'"></i> {{ template.name || '?' }}
                <span class="text-muted">{{ template.entry }}</span>
              </button>
            }
          </details>
        } @empty {
          @if (!loading()) {
            <div class="text-muted small p-1" data-testid="asset-none">{{ 'WORLD_EDITOR.EDEN.NO_ASSETS' | translate }}</div>
          }
        }
      </div>
    </div>
  `,
  styles: `
    .asset-browser {
      height: 100%;
      overflow: hidden;
    }
    .asset-list {
      overflow-y: auto;
    }
    .asset-group-title {
      font-weight: 600;
      font-size: 12px;
      padding: 2px 4px;
      cursor: pointer;
    }
    .asset-item {
      display: flex;
      gap: 6px;
      width: 100%;
      border: 0;
      background: none;
      text-align: left;
      font-size: 12px;
      padding: 1px 8px;
      color: var(--bs-body-color);
    }
    .asset-item:hover {
      background: var(--bs-secondary-bg, #333);
    }
    .asset-item .text-muted {
      margin-left: auto;
    }
  `,
})
export class AssetBrowserComponent implements OnInit {
  private readonly service = inject(WorldEditorService);
  private readonly destroyRef = inject(DestroyRef);

  readonly picked = output<AssetPick>();

  protected readonly MODES: { type: SpawnType; label: string; icon: string }[] = [
    { type: 'creature', label: 'WORLD_EDITOR.EDEN.CREATURES', icon: 'fa-dragon' },
    { type: 'gameobject', label: 'WORLD_EDITOR.EDEN.GAMEOBJECTS', icon: 'fa-cube' },
  ];
  protected readonly mode = signal<SpawnType>('creature');
  protected readonly group = new FormControl<number | null>(null);
  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly templates = signal<PlaceTemplate[]>([]);
  protected readonly loading = signal(false);
  protected readonly recent = signal<Recent>(loadRecent());
  private request = 0;

  protected readonly groups = computed<Option[]>(() => (this.mode() === 'creature' ? CREATURE_TYPE : GAMEOBJECT_TYPE));
  /** The templates by type (Eden's categories). */
  protected readonly sections = computed(() => {
    const byGroup = new Map<number, PlaceTemplate[]>();
    for (const template of this.templates()) {
      const group = template.group ?? 0;
      byGroup.set(group, [...(byGroup.get(group) ?? []), template]);
    }
    return [...byGroup]
      .sort(([a], [b]) => a - b)
      .map(([group, templates]) => ({
        group,
        name: this.groups().find((option) => option.value === group)?.name ?? String(group),
        templates,
      }));
  });

  ngOnInit(): void {
    merge(this.group.valueChanges, this.search.valueChanges.pipe(debounceTime(ASSET_SEARCH_DELAY)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => void this.load());
    void this.load();
  }

  protected setMode(mode: SpawnType): void {
    this.mode.set(mode);
    this.group.setValue(null, { emitEvent: false });
    void this.load();
  }

  private async load(): Promise<void> {
    const request = ++this.request;
    this.loading.set(true);
    const templates = await this.service
      .browseTemplates(this.mode(), this.group.value, this.search.value)
      .catch(() => [] as PlaceTemplate[]);
    if (request === this.request) {
      this.templates.set(templates);
      this.loading.set(false);
    }
  }

  protected pick(template: PlaceTemplate): void {
    const type = this.mode();
    const recent = {
      ...this.recent(),
      [type]: [template, ...this.recent()[type].filter((t) => t.entry !== template.entry)].slice(0, RECENT_KEPT),
    };
    this.recent.set(recent);
    try {
      localStorage.setItem(RECENT_ASSETS_KEY, JSON.stringify(recent));
    } catch {
      // (not kept)
    }
    this.picked.emit({ type, template });
  }
}
