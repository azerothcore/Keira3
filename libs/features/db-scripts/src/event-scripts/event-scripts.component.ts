import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EventScripts, WAYPOINT_SCRIPT_COMMAND } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { GenericOptionSelectorComponent } from '@keira/shared/selectors';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { EventScriptsHandlerService } from '../event-scripts-handler.service';
import { EventScriptsService } from './event-scripts.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-event-scripts',
  templateUrl: './event-scripts.component.html',
  imports: [
    TopBarComponent,
    TranslateDirective,
    TranslatePipe,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    EditorButtonsComponent,
    NgxDatatableModule,
    GenericOptionSelectorComponent,
  ],
})
export class EventScriptsComponent extends MultiRowEditorComponent<EventScripts> {
  protected override readonly editorService = inject(EventScriptsService);
  readonly handlerService = inject(EventScriptsHandlerService);
  /** (the same ScriptCommands as waypoint_scripts) */
  protected readonly COMMANDS = WAYPOINT_SCRIPT_COMMAND;
}
