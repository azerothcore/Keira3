import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SaiWaypoints } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TableRow } from '@keira/shared/constants';
import { SaiHandlerService } from '@keira/shared/sai-editor';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { SaiWaypointsHandlerService } from '../sai-waypoints-handler.service';
import { SaiWaypointsService } from './sai-waypoints.service';

/** A SmartAI script starting the path (SMART_ACTION_WP_START with the path as its param2). */
export interface SaiPathUser {
  entryorguid: number;
  sourceType: number;
  name: string;
  /** The map of a creature it runs on (null: none found). */
  map: number | null;
}

/** smart_scripts.action_type of SMART_ACTION_WP_START. */
const SMART_ACTION_WP_START = 53;

/**
 * SmartAI Path Editor: the points of a path in `waypoints` (where SmartAI's WP_START walks a creature), the scripts
 * starting it (opened in the SmartAI editor), and a way to see it in the World Editor.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sai-waypoints',
  templateUrl: './sai-waypoints.component.html',
  imports: [
    TopBarComponent,
    TranslateDirective,
    TranslatePipe,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipDirective,
    EditorButtonsComponent,
    NgxDatatableModule,
  ],
})
export class SaiWaypointsComponent extends MultiRowEditorComponent<SaiWaypoints> implements OnInit {
  protected override readonly editorService = inject(SaiWaypointsService);
  readonly handlerService = inject(SaiWaypointsHandlerService);
  private readonly saiHandler = inject(SaiHandlerService);
  private readonly router = inject(Router);
  protected readonly users = signal<SaiPathUser[]>([]);

  override ngOnInit(): void {
    super.ngOnInit();
    const entry = Math.trunc(Number(this.handlerService.selected));
    this.subscriptions.push(
      this.editorService.queryService
        .query<TableRow>(
          "SELECT DISTINCT s.entryorguid, s.source_type, IFNULL(ct.name, '') AS name, " +
            '(SELECT c.map FROM creature c WHERE (s.entryorguid > 0 AND c.id = s.entryorguid) OR (s.entryorguid < 0 AND c.guid = -s.entryorguid) LIMIT 1) AS map ' +
            'FROM smart_scripts s LEFT JOIN creature_template ct ON s.source_type = 0 AND ct.entry = s.entryorguid ' +
            `WHERE s.action_type = ${SMART_ACTION_WP_START} AND s.action_param2 = ${entry} LIMIT 50`,
        )
        .subscribe({
          next: (rows) =>
            this.users.set(
              (rows ?? []).map((row) => ({
                entryorguid: Number(row['entryorguid']),
                sourceType: Number(row['source_type']),
                name: String(row['name']),
                map: row['map'] === null || row['map'] === undefined ? null : Number(row['map']),
              })),
            ),
          error: () => this.users.set([]),
        }),
    );
  }

  /** Opens a script starting the path in the SmartAI editor. */
  protected openScript(user: SaiPathUser): void {
    this.saiHandler.selectFromEntity(user.sourceType, user.entryorguid);
  }

  /** Shows the path in the World Editor: at its first point, on the map of a creature walking it (else map 0). */
  protected showIn3d(): void {
    const [first] = [...this.editorService.newRows].sort((a, b) => a.pointid - b.pointid);
    const map = this.users().find((user) => user.map !== null)?.map ?? 0;
    void this.router.navigate(['world-editor'], {
      queryParams: {
        map,
        ...(first
          ? {
              x: first.position_x,
              y: first.position_y,
              z: first.position_z,
              select: `path:-${this.handlerService.selected}#${first.pointid}`,
            }
          : {}),
      },
    });
  }
}
