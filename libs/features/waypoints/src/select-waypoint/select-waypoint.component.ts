import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WAYPOINT_DATA_CUSTOM_STARTING_ID, WAYPOINT_DATA_ID, WAYPOINT_DATA_TABLE, WaypointData } from '@keira/shared/acore-world-model';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { WaypointHandlerService } from '../waypoint-handler.service';
import { SelectWaypointService } from './select-waypoint.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-waypoint.component.html',
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
export class SelectWaypointComponent extends SelectComponent<WaypointData> {
  readonly entityTable = WAYPOINT_DATA_TABLE;
  readonly entityIdField = WAYPOINT_DATA_ID;
  readonly customStartingId = WAYPOINT_DATA_CUSTOM_STARTING_ID;
  readonly selectService = inject(SelectWaypointService);
  readonly handlerService = inject(WaypointHandlerService);
}
