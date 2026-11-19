import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SCRIPT_WAYPOINT_ID, SCRIPT_WAYPOINT_TABLE, ScriptWaypoint } from '@keira/shared/acore-world-model';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { ScriptWaypointHandlerService } from '../script-waypoint-handler.service';
import { SelectScriptWaypointService } from './select-script-waypoint.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-script-waypoint.component.html',
  imports: [
    TopBarComponent,
    CreateComponent,
    TranslateDirective,
    TranslatePipe,
    FormsModule,
    ReactiveFormsModule,
    HighlightjsWrapperComponent,
    NgxDatatableModule,
  ],
})
export class SelectScriptWaypointComponent extends SelectComponent<ScriptWaypoint> {
  readonly entityTable = SCRIPT_WAYPOINT_TABLE;
  readonly entityIdField = SCRIPT_WAYPOINT_ID;
  readonly customStartingId = 1;
  readonly selectService = inject(SelectScriptWaypointService);
  readonly handlerService = inject(ScriptWaypointHandlerService);
}
