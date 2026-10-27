import { Service, signal } from '@angular/core';
import { GizmoMode } from '@keira/shared/world-viewer';
import { WorldBounds, WorldPosition } from '@keira/shared/wow-data';
import { ChangesSnapshot, WorldEditorChanges } from './world-editor-changes';
import { CopiedSpawn } from './group-edit';
import { EditorTool, LayerVisibility, SpawnType } from './world-editor.model';

/**
 * What the 3D world editor is in the middle of, kept while the app runs: leaving it for another editor (e.g. a
 * creature's SAI from the right-click menu) and coming back finds the pending changes, the undo history, the layers,
 * the open panels, the tool and the Path / LOS points as they were.
 */
@Service()
export class WorldEditorSessionService {
  readonly changes = new WorldEditorChanges();
  /** Snapshots of the pending changes for undo/redo; `historyIndex` is the current one. */
  history: ChangesSnapshot[] = [this.changes.snapshot()];
  historyIndex = 0;
  /** Last guid handed out per type, chained so quick consecutive placements never get the same guid. */
  readonly nextGuids = new Map<SpawnType, Promise<number>>();
  /** Path ids handed out to new paths in this session (not saved yet). */
  reservedPathIds: number[] = [];

  readonly layers = signal<LayerVisibility>({
    creatures: true,
    gameobjects: true,
    waypoints: true,
    areaTriggers: true,
    formations: true,
    pools: true,
    flightPaths: true,
    travel: true,
  });
  readonly tool = signal<EditorTool>('select');
  readonly gizmoMode = signal<GizmoMode>('translate');
  /** Where moved objects snap: nowhere, onto the ground/floor below, or against the nearest wall. */
  readonly snapMode = signal<'off' | 'ground' | 'wall'>('ground');
  readonly selectedKey = signal<string | undefined>(undefined);
  /** Spawns selected along with `selectedKey` (Ctrl + click): they move, turn and are deleted with it. */
  readonly groupKeys = signal<string[]>([]);
  /** Spawns copied (Ctrl + C), to paste at the crosshair (Ctrl + V). */
  readonly copied = signal<CopiedSpawn[]>([]);
  readonly zoneId = signal(0);
  readonly showFilters = signal(false);
  readonly showView = signal(false);
  readonly showControls = signal(false);
  /** The 2D world map is open over the 3D view. */
  readonly showMap = signal(false);
  readonly showLegend = signal(false);
  /** An area picked on the world map (Shift + drag), loaded whole. */
  readonly mapRegion = signal<WorldBounds | undefined>(undefined);

  /** The path "Check path" is on (its points are checked again whenever they change). */
  readonly checkedPathId = signal<number | undefined>(undefined);

  readonly probeFrom = signal<WorldPosition | undefined>(undefined);
  readonly probeTo = signal<WorldPosition | undefined>(undefined);
  readonly probeRange = signal(30);
  readonly probeHeight = signal(2);
}
