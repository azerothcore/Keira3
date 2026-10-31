import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WAYPOINT_MOVE_TYPE, WaypointData } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TableRow } from '@keira/shared/constants';
import { SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { WaypointHandlerService } from '../waypoint-handler.service';
import { WaypointScriptsHandlerService } from '../waypoint-scripts-handler.service';
import { WaypointDataService } from './waypoint-data.service';

/** A creature walking the path (by its `creature_addon`, or its template's). */
export interface PathWalker {
  guid: number;
  entry: number;
  name: string;
  map: number;
  x: number;
  y: number;
  z: number;
}

/**
 * Waypoint Editor: the points of a path (`waypoint_data`), with the creatures walking it, the action run at each point
 * (opened in the Waypoint Scripts editor), and a way to see it all in the World Editor.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-waypoint-data',
  templateUrl: './waypoint-data.component.html',
  imports: [
    TopBarComponent,
    TranslateDirective,
    TranslatePipe,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    SingleValueSelectorBtnComponent,
    TooltipDirective,
    EditorButtonsComponent,
    NgxDatatableModule,
  ],
})
export class WaypointDataComponent extends MultiRowEditorComponent<WaypointData> implements OnInit {
  protected override readonly editorService = inject(WaypointDataService);
  readonly handlerService = inject(WaypointHandlerService);
  private readonly scriptsHandler = inject(WaypointScriptsHandlerService);
  private readonly router = inject(Router);
  protected readonly MOVE_TYPE = WAYPOINT_MOVE_TYPE;
  protected readonly moveTypeName = (value: number) => WAYPOINT_MOVE_TYPE.find((option) => option.value === value)?.name ?? value;
  /** The creatures walking the path. */
  protected readonly walkers = signal<PathWalker[]>([]);

  override ngOnInit(): void {
    super.ngOnInit();
    const id = Math.trunc(Number(this.handlerService.selected));
    const part = (table: string, join: string) =>
      `SELECT c.guid, c.id AS entry, IFNULL(ct.name, '') AS name, c.map, c.position_x AS x, c.position_y AS y, c.position_z AS z ` +
      `FROM ${table} a JOIN creature c ON ${join} LEFT JOIN creature_template ct ON ct.entry = c.id WHERE a.path_id = ${id}`;
    this.subscriptions.push(
      this.editorService.queryService
        .query<TableRow>(`${part('creature_addon', 'c.guid = a.guid')} UNION ${part('creature_template_addon', 'c.id = a.entry')} LIMIT 50`)
        .subscribe({
          next: (rows) => this.walkers.set((rows ?? []).map((row) => this.walker(row))),
          // (a database without one of the tables: none)
          error: () => this.walkers.set([]),
        }),
    );
  }

  private walker(row: TableRow): PathWalker {
    const [guid, entry, map, x, y, z] = ['guid', 'entry', 'map', 'x', 'y', 'z'].map((key) => Number(row[key]));
    return { guid, entry, name: String(row['name']), map, x, y, z };
  }

  /**
   * Shows the path in the World Editor (in its tab): at a creature walking it, else at its first point, on that
   * creature's map (else the first walker's, else map 0), its first point selected.
   */
  protected showIn3d(walker?: PathWalker): void {
    const rows = [...this.editorService.newRows].sort((a, b) => a.point - b.point);
    const first = rows[0];
    const at = walker ?? (first && { ...first, x: first.position_x, y: first.position_y, z: first.position_z });
    const map = walker?.map ?? this.walkers()[0]?.map ?? 0;
    void this.router.navigate(['world-editor'], {
      queryParams: {
        map,
        ...(at ? { x: at.x, y: at.y, z: at.z } : {}),
        ...(first ? { select: `path:${this.handlerService.selected}#${first.point}` } : {}),
      },
    });
  }

  /** Opens the action run at a point in the Waypoint Scripts editor. */
  protected editAction(action: number): void {
    this.scriptsHandler.select(false, action, `${action}`);
  }
}
