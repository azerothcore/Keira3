import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WaypointDataAddon } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { WaypointHandlerService } from '../waypoint-handler.service';
import { WaypointDataAddonService } from './waypoint-data-addon.service';

/** Waypoint Editor > spline points: the points of the curve leading to each point of the path (`waypoint_data_addon`). */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-waypoint-data-addon',
  templateUrl: './waypoint-data-addon.component.html',
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
export class WaypointDataAddonComponent extends MultiRowEditorComponent<WaypointDataAddon> {
  protected override readonly editorService = inject(WaypointDataAddonService);
  readonly handlerService = inject(WaypointHandlerService);
}
