import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CONDITION_SOURCE_TYPES, Conditions } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { QueryOutputComponent } from '@keira/shared/base-editor-components';
import { getEnumKeys } from '@keira/shared/utils';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { ConditionsHandlerService } from '../conditions-handler.service';
import { ConditionFieldsComponent } from '../condition-fields/condition-fields.component';
import { SOURCE_ENTRY_TOOLTIPS, SOURCE_GROUP_TOOLTIPS } from './conditions-constants';
import { ConditionsService } from './conditions.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-conditions',
  templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.scss'],
  imports: [
    TranslateDirective,
    TranslatePipe,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipDirective,
    ConditionFieldsComponent,
  ],
})
export class ConditionsComponent extends SingleRowEditorComponent<Conditions> {
  readonly CONDITION_SOURCE_TYPES = CONDITION_SOURCE_TYPES;
  readonly CONDITION_SOURCE_TYPES_KEYS = getEnumKeys(CONDITION_SOURCE_TYPES);
  readonly SOURCE_GROUP_TOOLTIPS = SOURCE_GROUP_TOOLTIPS;
  readonly SOURCE_ENTRY_TOOLTIPS = SOURCE_ENTRY_TOOLTIPS;

  get selectedSourceType(): number {
    return this.editorService.form.controls.SourceTypeOrReferenceId.value;
  }

  override readonly editorService = inject(ConditionsService);
  readonly handlerService = inject(ConditionsHandlerService);
}
