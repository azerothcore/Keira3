import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ScriptWaypoint } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TableRow, WORLD_EDITOR_LINKS } from '@keira/shared/constants';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { ScriptWaypointHandlerService } from '../script-waypoint-handler.service';
import { ScriptWaypointService } from './script-waypoint.service';

/** The creature walking an escort path: its name, C++ script and a spawn of it. */
export interface EscortCreature {
  name: string;
  scriptName: string;
  /** Where one of its spawns is (null: not spawned). */
  map: number | null;
}

/**
 * Escort Path Editor: the points of a C++ escort script's path (`script_waypoint`, by creature entry), the creature and
 * its script, and a way to see the path in the World Editor (with View > Every path in the area).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-script-waypoint',
  templateUrl: './script-waypoint.component.html',
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
export class ScriptWaypointComponent extends MultiRowEditorComponent<ScriptWaypoint> implements OnInit {
  protected override readonly editorService = inject(ScriptWaypointService);
  readonly handlerService = inject(ScriptWaypointHandlerService);
  private readonly router = inject(Router);
  protected readonly links = inject(WORLD_EDITOR_LINKS, { optional: true });
  protected readonly creature = signal<EscortCreature | undefined>(undefined);

  override ngOnInit(): void {
    super.ngOnInit();
    const entry = this.entry();
    this.subscriptions.push(
      this.editorService.queryService
        .query<TableRow>(
          `SELECT name, ScriptName, (SELECT map FROM creature WHERE id = ${entry} LIMIT 1) AS map FROM creature_template WHERE entry = ${entry}`,
        )
        .subscribe({
          next: (rows) => {
            const row = rows?.[0];
            this.creature.set(
              row && {
                name: String(row['name']),
                scriptName: String(row['ScriptName'] ?? ''),
                map: row['map'] === null || row['map'] === undefined ? null : Number(row['map']),
              },
            );
          },
          error: () => this.creature.set(undefined),
        }),
    );
  }

  protected openCreature(name: string): void {
    this.links?.openCreature(this.entry(), name);
  }

  /** Shows the path's first point in the World Editor, on the map of a spawn of the creature (else map 0). */
  protected showIn3d(): void {
    const [first] = [...this.editorService.newRows].sort((a, b) => a.pointid - b.pointid);
    void this.router.navigate(['world-editor'], {
      queryParams: {
        map: this.creature()?.map ?? 0,
        ...(first ? { x: first.location_x, y: first.location_y, z: first.location_z } : {}),
      },
    });
  }

  private entry(): number {
    return Math.trunc(Number(this.handlerService.selected));
  }
}
