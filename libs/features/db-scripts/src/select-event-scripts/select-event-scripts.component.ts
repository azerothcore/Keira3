import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EVENT_SCRIPTS_ID, EVENT_SCRIPTS_TABLE, EventScripts } from '@keira/shared/acore-world-model';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { EventScriptsHandlerService } from '../event-scripts-handler.service';
import { SelectEventScriptsService } from './select-event-scripts.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-select-event-scripts',
  templateUrl: './select-event-scripts.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateDirective,
    TranslatePipe,
    NgxDatatableModule,
    CreateComponent,
    HighlightjsWrapperComponent,
    TopBarComponent,
  ],
})
export class SelectEventScriptsComponent extends SelectComponent<EventScripts> {
  protected override readonly entityTable = EVENT_SCRIPTS_TABLE;
  protected override readonly entityIdField = EVENT_SCRIPTS_ID;
  readonly customStartingId = 1;
  protected readonly selectService = inject(SelectEventScriptsService);
  readonly handlerService = inject(EventScriptsHandlerService);
}
