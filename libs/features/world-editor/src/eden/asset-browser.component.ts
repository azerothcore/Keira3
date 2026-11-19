import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CREATURE_TYPE, GAMEOBJECT_TYPE } from '@keira/shared/acore-world-model';
import { Option } from '@keira/shared/constants';
import { TranslatePipe } from '@ngx-translate/core';
import { debounceTime, merge } from 'rxjs';
import { PlaceTemplate, SpawnType } from '../world-editor.model';
import { WorldEditorService } from '../world-editor.service';
import { Composition, CompositionsService } from './compositions';

export const ASSET_SEARCH_DELAY = 300;
export const RECENT_ASSETS_KEY = 'keira3.worldEditor.recentAssets';
const RECENT_KEPT = 10;

/** A mode of the browser (Eden's asset types, F1–F3). */
export type AssetMode = SpawnType | 'composition';

/** What the editor asks of the browser (a key pressed): a mode, or the search focused. */
export interface AssetRequest {
  n: number;
  mode?: AssetMode;
  search?: boolean;
}

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
      @if (mode() === 'composition') {
        <form class="input-group input-group-sm mb-1" (submit)="$event.preventDefault(); saveComposition()">
          <input
            class="form-control"
            data-testid="composition-name"
            [placeholder]="'WORLD_EDITOR.EDEN.COMPOSITION_NAME' | translate"
            [formControl]="compositionName"
          />
          <button
            type="submit"
            class="btn btn-outline-success"
            data-testid="composition-save"
            [disabled]="!selectionCount() || !compositionName.value.trim()"
            [title]="'WORLD_EDITOR.EDEN.COMPOSITION_SAVE_HELP' | translate"
          >
            <i class="fa fa-save"></i> {{ 'WORLD_EDITOR.EDEN.COMPOSITION_SAVE' | translate: { count: selectionCount() } }}
          </button>
        </form>
        <div class="asset-list flex-grow-1">
          @for (composition of compositions.compositions(); track composition.id) {
            <div class="d-flex">
              <button
                type="button"
                class="asset-item"
                [class.active]="composition.id === pickedComposition()"
                [attr.data-testid]="'composition-' + composition.id"
                (click)="pickComposition(composition)"
              >
                <i class="fa fa-object-group"></i> {{ composition.name }}
                <span class="text-muted">{{ composition.members.length }}</span>
              </button>
              <button
                type="button"
                class="btn btn-sm btn-link text-danger py-0"
                [attr.data-testid]="'composition-delete-' + composition.id"
                [title]="'WORLD_EDITOR.EDEN.COMPOSITION_DELETE' | translate"
                (click)="compositions.remove(composition.id)"
              >
                <i class="fa fa-trash"></i>
              </button>
            </div>
          } @empty {
            <div class="text-muted small p-1" data-testid="composition-none">{{ 'WORLD_EDITOR.EDEN.NO_COMPOSITIONS' | translate }}</div>
          }
        </div>
      } @else {
      <select class="form-select form-select-sm mb-1" data-testid="asset-group" [formControl]="group">
        <option [ngValue]="null">{{ 'WORLD_EDITOR.EDEN.ALL_TYPES' | translate }}</option>
        @for (option of groups(); track option.value) {
          <option [ngValue]="option.value">{{ option.value }} - {{ option.name }}</option>
        }
      </select>
      <input
        #searchInput
        class="form-control form-control-sm mb-1"
        data-testid="asset-search"
        [placeholder]="'WORLD_EDITOR.EDEN.SEARCH' | translate"
        [title]="'WORLD_EDITOR.EDEN.SEARCH_HELP' | translate"
        [formControl]="search"
      />

      <div class="asset-list flex-grow-1">
        @if (recentOf().length) {
          <div class="asset-group-title">{{ 'WORLD_EDITOR.EDEN.RECENT' | translate }}</div>
          @for (template of recentOf(); track template.entry) {
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
      }
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
    .asset-item:hover,
    .asset-item.active {
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

  protected readonly compositions = inject(CompositionsService);

  /** How many spawns are selected in the editor (what a composition is saved from). */
  readonly selectionCount = input(0);
  /** Asked by the editor's keys: a mode (F1–F3), or the search focused (Ctrl+F). */
  readonly request = input<AssetRequest>({ n: 0 });
  readonly picked = output<AssetPick>();
  readonly compositionPicked = output<Composition>();
  /** Save the selection as a composition of this name. */
  readonly compositionSaved = output<string>();

  protected readonly MODES: { type: AssetMode; label: string; icon: string }[] = [
    { type: 'creature', label: 'WORLD_EDITOR.EDEN.CREATURES', icon: 'fa-dragon' },
    { type: 'gameobject', label: 'WORLD_EDITOR.EDEN.GAMEOBJECTS', icon: 'fa-cube' },
    { type: 'composition', label: 'WORLD_EDITOR.EDEN.COMPOSITIONS', icon: 'fa-object-group' },
  ];
  protected readonly mode = signal<AssetMode>('creature');
  protected readonly compositionName = new FormControl('', { nonNullable: true });
  protected readonly pickedComposition = signal<string | undefined>(undefined);
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  /** The recently used templates of the mode (not drawn for the compositions). */
  protected readonly recentOf = computed(() => this.recent()[this.mode() as SpawnType]);
  private readonly onRequest = effect(() => {
    const request = this.request();
    untracked(() => {
      if (request.mode) {
        this.setMode(request.mode);
      } else if (request.search) {
        if (this.mode() === 'composition') {
          this.setMode('creature');
        }
        // (once the search is drawn)
        setTimeout(() => this.searchInput()?.nativeElement.focus());
      }
    });
  });
  protected readonly group = new FormControl<number | null>(null);
  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly templates = signal<PlaceTemplate[]>([]);
  protected readonly loading = signal(false);
  protected readonly recent = signal<Recent>(loadRecent());
  private loads = 0;

  protected readonly groups = computed<Option[]>(() => (this.mode() === 'gameobject' ? GAMEOBJECT_TYPE : CREATURE_TYPE));
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

  protected setMode(mode: AssetMode): void {
    if (mode === this.mode()) {
      return;
    }
    this.mode.set(mode);
    this.group.setValue(null, { emitEvent: false });
    void this.load();
  }

  private async load(): Promise<void> {
    const mode = this.mode();
    if (mode === 'composition') {
      return;
    }
    const request = ++this.loads;
    this.loading.set(true);
    const templates = await this.service.browseTemplates(mode, this.group.value, this.search.value).catch(() => [] as PlaceTemplate[]);
    if (request === this.loads) {
      this.templates.set(templates);
      this.loading.set(false);
    }
  }

  protected pickComposition(composition: Composition): void {
    this.pickedComposition.set(composition.id);
    this.compositionPicked.emit(composition);
  }

  protected saveComposition(): void {
    const name = this.compositionName.value.trim();
    if (name && this.selectionCount()) {
      this.compositionSaved.emit(name);
      this.compositionName.setValue('');
    }
  }

  protected pick(template: PlaceTemplate): void {
    const type = this.mode() as SpawnType;
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
