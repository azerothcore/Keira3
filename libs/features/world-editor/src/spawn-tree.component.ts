import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { WowZone } from '@keira/shared/wow-data';
import { TranslatePipe } from '@ngx-translate/core';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { buildSpawnTree, checkState, NO_ZONE, openableIds, setShown, SpawnTreeNode, treeRows } from './spawn-tree';
import { SpawnRecord } from './world-editor.model';

/** Whether picking a spawn in the tree also flies the camera to it, kept on this computer. */
export const TREE_SNAP_KEY = 'keira3.worldEditor.treeSnapCamera';

function loadSnap(): boolean {
  try {
    return localStorage.getItem(TREE_SNAP_KEY) !== 'false';
  } catch {
    return true;
  }
}

/**
 * Everything loaded, as a tree (zone → creatures / gameobjects → entry → spawn), each row with a tick box that shows or
 * hides its spawns in the view, a filter, and picking a spawn to select it (and fly there).
 */
@Component({
  selector: 'keira-spawn-tree',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, TooltipDirective],
  template: `
    <div class="spawn-tree card card-body p-2" data-testid="spawn-tree">
      <div class="d-flex align-items-center gap-1 mb-1">
        <strong class="flex-grow-1">{{ 'WORLD_EDITOR.TREE' | translate }}</strong>
        <small class="text-muted" data-testid="tree-count">{{ shownCount() }} / {{ spawns().length }}</small>
        <button
          type="button"
          class="btn-close btn-sm"
          data-testid="tree-close"
          [attr.aria-label]="'WORLD_EDITOR.CLOSE' | translate"
          (click)="closed.emit()"
        ></button>
      </div>
      <input
        type="search"
        class="form-control form-control-sm mb-1"
        data-testid="tree-filter"
        [value]="filter()"
        [placeholder]="'WORLD_EDITOR.TREE_FILTER' | translate"
        [tooltip]="'WORLD_EDITOR.TREE_FILTER_HELP' | translate"
        placement="auto"
        container="body"
        (input)="filter.set($any($event.target).value)"
        (keydown.escape)="filter.set('')"
      />
      <div class="d-flex flex-wrap gap-1 mb-1">
        <button type="button" class="btn btn-sm btn-outline-secondary py-0" data-testid="tree-check-all" (click)="showAll(true)">
          {{ 'WORLD_EDITOR.TREE_CHECK_ALL' | translate }}
        </button>
        <button type="button" class="btn btn-sm btn-outline-secondary py-0" data-testid="tree-uncheck-all" (click)="showAll(false)">
          {{ 'WORLD_EDITOR.TREE_UNCHECK_ALL' | translate }}
        </button>
        <button type="button" class="btn btn-sm btn-outline-secondary py-0" data-testid="tree-expand-all" (click)="expandAll()">
          {{ 'WORLD_EDITOR.TREE_EXPAND_ALL' | translate }}
        </button>
        <button type="button" class="btn btn-sm btn-outline-secondary py-0" data-testid="tree-collapse-all" (click)="collapseAll()">
          {{ 'WORLD_EDITOR.TREE_COLLAPSE_ALL' | translate }}
        </button>
      </div>
      <label class="form-check form-check-inline small mb-1">
        <input
          type="checkbox"
          class="form-check-input"
          data-testid="tree-snap"
          [checked]="snap()"
          (change)="setSnap($any($event.target).checked)"
        />
        {{ 'WORLD_EDITOR.TREE_SNAP' | translate }}
        <i class="fas fa-info-circle ms-1" placement="auto" container="body" [tooltip]="'WORLD_EDITOR.TREE_SNAP_HELP' | translate"></i>
      </label>
      <div class="spawn-tree-rows" data-testid="tree-rows">
        @for (row of rows(); track row.node.id) {
          @let node = row.node;
          @let state = stateOf(node);
          <div
            class="spawn-tree-row"
            [class.selected]="node.id === selectedKey()"
            [style.padding-left.px]="row.depth * 14"
            [attr.data-testid]="'tree-row-' + node.id"
          >
            @if (node.children.length) {
              <button type="button" class="spawn-tree-caret" [attr.data-testid]="'tree-open-' + node.id" (click)="toggleOpen(node.id)">
                <i class="fa" [class.fa-caret-down]="row.open" [class.fa-caret-right]="!row.open"></i>
              </button>
            } @else {
              <span class="spawn-tree-caret"></span>
            }
            <input
              type="checkbox"
              class="form-check-input mt-0"
              [attr.data-testid]="'tree-check-' + node.id"
              [checked]="state === 'all'"
              [indeterminate]="state === 'some'"
              (change)="show(node, $any($event.target).checked)"
            />
            <button
              type="button"
              class="spawn-tree-label"
              [attr.data-testid]="'tree-label-' + node.id"
              (click)="node.spawn ? picked.emit({ spawn: node.spawn, snap: snap() }) : toggleOpen(node.id)"
            >
              @switch (node.kind) {
                @case ('zone') {
                  <i class="fa fa-map-marked-alt"></i> {{ node.id === noZone ? ('WORLD_EDITOR.TREE_NO_ZONE' | translate) : node.label }}
                }
                @case ('type') {
                  <i class="fa" [class.fa-dragon]="node.type === 'creature'" [class.fa-cube]="node.type === 'gameobject'"></i>
                  {{ (node.type === 'creature' ? 'WORLD_EDITOR.CREATURES' : 'WORLD_EDITOR.GAMEOBJECTS') | translate }}
                }
                @case ('entry') {
                  {{ node.label }}
                }
                @default {
                  <span class="text-muted">GUID</span> {{ node.label }}
                }
              }
            </button>
            @if (node.kind !== 'spawn') {
              <span class="badge bg-secondary ms-auto">{{ node.keys.length }}</span>
            }
          </div>
        } @empty {
          <div class="text-muted small">{{ 'WORLD_EDITOR.NO_RESULTS' | translate }}</div>
        }
      </div>
    </div>
  `,
  styles: `
    .spawn-tree {
      height: 100%;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
    }
    .spawn-tree-rows {
      overflow-y: auto;
      flex: 1 1 auto;
      min-height: 0;
      font-size: 0.85em;
    }
    .spawn-tree-row {
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;

      &.selected {
        background: var(--bs-primary-bg-subtle, #cfe2ff);
      }
    }
    .spawn-tree-caret {
      width: 14px;
      flex: none;
      border: 0;
      padding: 0;
      background: none;
      color: inherit;
    }
    .spawn-tree-label {
      border: 0;
      padding: 0 2px;
      background: none;
      color: inherit;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `,
})
export class SpawnTreeComponent {
  /** Every loaded spawn (the ones the tree hides too). */
  readonly spawns = input.required<SpawnRecord[]>();
  readonly zones = input<WowZone[]>([]);
  /** Spawns hidden with the tick boxes. */
  readonly hidden = input<ReadonlySet<string>>(new Set());
  readonly selectedKey = input<string | undefined>(undefined);
  readonly hiddenChange = output<Set<string>>();
  /** A spawn picked: select it, and fly there when `snap`. */
  readonly picked = output<{ spawn: SpawnRecord; snap: boolean }>();
  readonly closed = output<void>();

  protected readonly noZone = NO_ZONE;
  protected readonly filter = signal('');
  protected readonly snap = signal(loadSnap());
  /** Opened rows; while filtering, the zones and types open by themselves. */
  protected readonly opened = signal<ReadonlySet<string>>(new Set());
  protected readonly tree = computed(() => buildSpawnTree(this.spawns(), this.zones(), this.filter()));
  protected readonly rows = computed(() => {
    const tree = this.tree();
    const open = new Set(this.opened());
    if (this.filter().trim()) {
      tree.forEach((zone) => [zone, ...zone.children].forEach((node) => open.add(node.id)));
    }
    return treeRows(tree, open);
  });
  protected readonly shownCount = computed(() => this.spawns().length - this.hidden().size);

  protected stateOf(node: SpawnTreeNode): 'all' | 'none' | 'some' {
    return checkState(node.keys, this.hidden());
  }

  protected show(node: SpawnTreeNode, shown: boolean): void {
    this.hiddenChange.emit(setShown(this.hidden(), node.keys, shown));
  }

  /** Check all / Uncheck all: every spawn in the tree (the ones the filter keeps). */
  protected showAll(shown: boolean): void {
    this.hiddenChange.emit(
      setShown(
        this.hidden(),
        this.tree().flatMap((zone) => zone.keys),
        shown,
      ),
    );
  }

  protected toggleOpen(id: string): void {
    const next = new Set(this.opened());
    if (!next.delete(id)) {
      next.add(id);
    }
    this.opened.set(next);
  }

  /** Opens everything but the entries' spawn lists (thousands of rows): those open one at a time. */
  protected expandAll(): void {
    this.opened.set(new Set(openableIds(this.tree()).filter((id) => !this.isEntry(id))));
  }

  private isEntry(id: string): boolean {
    return id.split(':').length > 3;
  }

  protected setSnap(snap: boolean): void {
    this.snap.set(snap);
    try {
      localStorage.setItem(TREE_SNAP_KEY, String(snap));
    } catch {
      // (not kept)
    }
  }

  protected collapseAll(): void {
    this.opened.set(new Set());
  }
}
