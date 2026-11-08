import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  WAYPOINT_SCRIPTS_CUSTOM_STARTING_ID,
  WAYPOINT_SCRIPTS_ID,
  WAYPOINT_SCRIPTS_TABLE,
  WaypointScripts,
} from '@keira/shared/acore-world-model';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { WaypointScriptsHandlerService } from '../waypoint-scripts-handler.service';
import { SelectWaypointScriptsService } from './select-waypoint-scripts.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-waypoint-scripts.component.html',
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
export class SelectWaypointScriptsComponent extends SelectComponent<WaypointScripts> {
  readonly entityTable = WAYPOINT_SCRIPTS_TABLE;
  readonly entityIdField = WAYPOINT_SCRIPTS_ID;
  readonly customStartingId = WAYPOINT_SCRIPTS_CUSTOM_STARTING_ID;
  readonly selectService = inject(SelectWaypointScriptsService);
  readonly handlerService = inject(WaypointScriptsHandlerService);
}
