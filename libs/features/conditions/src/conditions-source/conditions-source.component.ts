import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Conditions } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { ConditionFieldsComponent } from '../condition-fields/condition-fields.component';
import { sourceText } from '../edit-conditions/condition-comment';
import { ConditionsSourceHandlerService } from './conditions-source-handler.service';
import { ConditionsSourceService } from './conditions-source.service';

/** All the conditions of one source in a table, the selected one in the form below, as SmartAI scripts are (#3154). */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-conditions-source',
  templateUrl: './conditions-source.component.html',
  imports: [
    TopBarComponent,
    TranslateDirective,
    TranslatePipe,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    EditorButtonsComponent,
    NgxDatatableModule,
    ConditionFieldsComponent,
  ],
})
export class ConditionsSourceComponent extends MultiRowEditorComponent<Conditions> {
  protected override readonly editorService = inject(ConditionsSourceService);
  readonly handlerService = inject(ConditionsSourceHandlerService);

  protected get source(): Conditions {
    return Object.assign(new Conditions(), JSON.parse(this.handlerService.selected));
  }

  /** What the source is, in words. */
  protected get sourceName(): string {
    return sourceText(this.source);
  }
}
