import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WAYPOINT_SCRIPT_COMMAND, WaypointScripts } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TableRow } from '@keira/shared/constants';
import { SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { WaypointHandlerService } from '../waypoint-handler.service';
import { WaypointScriptsHandlerService } from '../waypoint-scripts-handler.service';
import { WaypointScriptsService } from './waypoint-scripts.service';

/**
 * Waypoint Scripts: the steps of an action run at waypoints (`waypoint_scripts`: what it does, after how many
 * seconds), and the points of the paths running it (opened in the Waypoint Editor).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-waypoint-scripts',
  templateUrl: './waypoint-scripts.component.html',
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
export class WaypointScriptsComponent extends MultiRowEditorComponent<WaypointScripts> implements OnInit {
  protected override readonly editorService = inject(WaypointScriptsService);
  readonly handlerService = inject(WaypointScriptsHandlerService);
  private readonly pathHandler = inject(WaypointHandlerService);
  protected readonly COMMAND = WAYPOINT_SCRIPT_COMMAND;
  protected readonly commandName = (value: number) =>
    WAYPOINT_SCRIPT_COMMAND.find((option) => option.value === value)?.name.split(' ')[0] ?? value;
  /** The points running the action: their path and point. */
  protected readonly usedAt = signal<{ id: number; point: number }[]>([]);

  override ngOnInit(): void {
    super.ngOnInit();
    const id = Math.trunc(Number(this.handlerService.selected));
    this.subscriptions.push(
      this.editorService.queryService
        .query<TableRow>(`SELECT id, point FROM waypoint_data WHERE action = ${id} ORDER BY id, point LIMIT 50`)
        .subscribe({
          next: (rows) => this.usedAt.set((rows ?? []).map((row) => ({ id: Number(row['id']), point: Number(row['point']) }))),
          error: () => this.usedAt.set([]),
        }),
    );
  }

  /** Opens a path running the action in the Waypoint Editor. */
  protected openPath(id: number): void {
    this.pathHandler.select(false, id, `${id}`);
  }
}
