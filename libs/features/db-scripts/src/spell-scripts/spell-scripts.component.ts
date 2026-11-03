import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpellScripts, WAYPOINT_SCRIPT_COMMAND } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { GenericOptionSelectorComponent } from '@keira/shared/selectors';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { SpellScriptsHandlerService } from '../spell-scripts-handler.service';
import { SpellScriptsService } from './spell-scripts.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-scripts',
  templateUrl: './spell-scripts.component.html',
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
export class SpellScriptsComponent extends MultiRowEditorComponent<SpellScripts> {
  protected override readonly editorService = inject(SpellScriptsService);
  readonly handlerService = inject(SpellScriptsHandlerService);
  /** (the same ScriptCommands as waypoint_scripts) */
  protected readonly COMMANDS = WAYPOINT_SCRIPT_COMMAND;
}
