import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SAI_WAYPOINTS_CUSTOM_STARTING_ID, SAI_WAYPOINTS_ID, SAI_WAYPOINTS_TABLE, SaiWaypoints } from '@keira/shared/acore-world-model';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { SaiWaypointsHandlerService } from '../sai-waypoints-handler.service';
import { SelectSaiWaypointsService } from './select-sai-waypoints.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-sai-waypoints.component.html',
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
export class SelectSaiWaypointsComponent extends SelectComponent<SaiWaypoints> {
  readonly entityTable = SAI_WAYPOINTS_TABLE;
  readonly entityIdField = SAI_WAYPOINTS_ID;
  readonly customStartingId = SAI_WAYPOINTS_CUSTOM_STARTING_ID;
  readonly selectService = inject(SelectSaiWaypointsService);
  readonly handlerService = inject(SaiWaypointsHandlerService);
}
