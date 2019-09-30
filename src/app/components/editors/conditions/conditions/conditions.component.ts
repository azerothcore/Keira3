import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '../../shared/single-row-editor.component';
import { ConditionsHandlerService } from '../../../../services/handlers/conditions-handler.service';
import {
  CONDITION_SOURCE_TYPES,
  CONDITION_SOURCE_TYPES_KEYS,
  CONDITION_TYPES,
  CONDITION_TYPES_KEYS,
  Conditions
} from '../../../../types/conditions.type';
import { ConditionsService } from '../../../../services/editors/conditions/conditions.service';
import { CONDITION_TARGET_TOOLTIPS, SOURCE_ENTRY_TOOLTIPS, SOURCE_GROUP_TOOLTIPS } from './conditions-constants';

@Component({
  selector: 'app-conditions',
  templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.scss']
})
export class ConditionsComponent extends SingleRowEditorComponent<Conditions> {

  public readonly CONDITION_SOURCE_TYPES = CONDITION_SOURCE_TYPES;
  public readonly CONDITION_SOURCE_TYPES_KEYS = CONDITION_SOURCE_TYPES_KEYS;
  public readonly CONDITION_TYPES = CONDITION_TYPES;
  public readonly CONDITION_TYPES_KEYS = CONDITION_TYPES_KEYS;

  public readonly SOURCE_GROUP_TOOLTIPS = SOURCE_GROUP_TOOLTIPS;
  public readonly SOURCE_ENTRY_TOOLTIPS = SOURCE_ENTRY_TOOLTIPS;
  public readonly CONDITION_TARGET_TOOLTIPS = CONDITION_TARGET_TOOLTIPS;

  get selectedSourceType(): number {
   return this.editorService.form.get('SourceTypeOrReferenceId').value;
  }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ConditionsService,
    public handlerService: ConditionsHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
