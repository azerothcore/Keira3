import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WaypointData, WAYPOINT_DATA_TABLE } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CreatureHandlerService } from '../creature-handler.service';
import { WaypointDataService } from './waypoint-data.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-waypoint-data',
  templateUrl: './waypoint-data.component.html',
  imports: [
    TopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    EditorButtonsComponent,
    NgxDatatableModule,
    TooltipModule,
  ],
})
export class WaypointDataComponent extends MultiRowEditorComponent<WaypointData> {
  protected override get docUrl(): string {
    return this.WIKI_BASE_URL + WAYPOINT_DATA_TABLE;
  }

  protected override readonly editorService = inject(WaypointDataService);
  readonly handlerService = inject(CreatureHandlerService);
}
