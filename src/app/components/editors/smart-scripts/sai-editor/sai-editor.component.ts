import { Component } from '@angular/core';

import { SaiHandlerService } from '../../../../services/handlers/sai-handler.service';
import { MultiRowEditorComponent } from '../../shared/multi-row-editor.component';
import {
  SAI_ACTION_TOOLTIPS,
  SAI_ACTIONS,
  SAI_ACTIONS_KEYS,
  SAI_EVENT_TOOLTIPS,
  SAI_EVENTS,
  SAI_EVENTS_KEYS,
  SAI_TARGET_TOOLTIPS,
  SAI_TARGETS,
  SAI_TARGETS_KEYS,
  EVENT_PARAM1_TEXTS,
  EVENT_PARAM2_TEXTS,
  EVENT_PARAM3_TEXTS,
  EVENT_PARAM4_TEXTS,
  EVENT_PARAM5_TEXTS,
  ACTION_PARAM1_TEXTS,
  ACTION_PARAM2_TEXTS,
  ACTION_PARAM3_TEXTS,
  ACTION_PARAM4_TEXTS,
  ACTION_PARAM5_TEXTS,
  ACTION_PARAM6_TEXTS,
  TARGET_PARAM1_TEXTS,
  TARGET_PARAM2_TEXTS,
  TARGET_PARAM3_TEXTS,
  TARGET_PARAM4_TEXTS,
  EVENT_PARAM1_TOOLTIPS,
  EVENT_PARAM2_TOOLTIPS,
  EVENT_PARAM3_TOOLTIPS,
  EVENT_PARAM4_TOOLTIPS,
  EVENT_PARAM5_TOOLTIPS,
  ACTION_PARAM1_TOOLTIPS,
  ACTION_PARAM2_TOOLTIPS,
  ACTION_PARAM3_TOOLTIPS,
  ACTION_PARAM4_TOOLTIPS,
  ACTION_PARAM5_TOOLTIPS,
  ACTION_PARAM6_TOOLTIPS,
  TARGET_PARAM1_TOOLTIPS,
  TARGET_PARAM2_TOOLTIPS,
  TARGET_PARAM3_TOOLTIPS,
  TARGET_PARAM4_TOOLTIPS,
  SmartScripts
} from '../../../../types/smart-scripts.type';
import { SaiEditorService } from '../../../../services/editors/sai/sai-editor.service';

@Component({
  selector: 'app-sai-editor',
  templateUrl: './sai-editor.component.html',
  styleUrls: ['./sai-editor.component.scss']
})
export class SaiEditorComponent extends MultiRowEditorComponent<SmartScripts> {
  public readonly SAI_EVENTS = SAI_EVENTS;
  public readonly SAI_EVENTS_KEYS = SAI_EVENTS_KEYS;
  public readonly SAI_ACTIONS = SAI_ACTIONS;
  public readonly SAI_ACTIONS_KEYS = SAI_ACTIONS_KEYS;
  public readonly SAI_TARGETS = SAI_TARGETS;
  public readonly SAI_TARGETS_KEYS = SAI_TARGETS_KEYS;
  public readonly SAI_EVENT_TOOLTIPS = SAI_EVENT_TOOLTIPS;
  public readonly SAI_ACTION_TOOLTIPS = SAI_ACTION_TOOLTIPS;
  public readonly SAI_TARGET_TOOLTIPS = SAI_TARGET_TOOLTIPS;
  public readonly EVENT_PARAM1_TEXTS = EVENT_PARAM1_TEXTS;
  public readonly EVENT_PARAM2_TEXTS = EVENT_PARAM2_TEXTS;
  public readonly EVENT_PARAM3_TEXTS = EVENT_PARAM3_TEXTS;
  public readonly EVENT_PARAM4_TEXTS = EVENT_PARAM4_TEXTS;
  public readonly EVENT_PARAM5_TEXTS = EVENT_PARAM5_TEXTS;
  public readonly ACTION_PARAM1_TEXTS = ACTION_PARAM1_TEXTS;
  public readonly ACTION_PARAM2_TEXTS = ACTION_PARAM2_TEXTS;
  public readonly ACTION_PARAM3_TEXTS = ACTION_PARAM3_TEXTS;
  public readonly ACTION_PARAM4_TEXTS = ACTION_PARAM4_TEXTS;
  public readonly ACTION_PARAM5_TEXTS = ACTION_PARAM5_TEXTS;
  public readonly ACTION_PARAM6_TEXTS = ACTION_PARAM6_TEXTS;
  public readonly TARGET_PARAM1_TEXTS = TARGET_PARAM1_TEXTS;
  public readonly TARGET_PARAM2_TEXTS = TARGET_PARAM2_TEXTS;
  public readonly TARGET_PARAM3_TEXTS = TARGET_PARAM3_TEXTS;
  public readonly TARGET_PARAM4_TEXTS = TARGET_PARAM4_TEXTS;
  public readonly EVENT_PARAM1_TOOLTIPS = EVENT_PARAM1_TOOLTIPS;
  public readonly EVENT_PARAM2_TOOLTIPS = EVENT_PARAM2_TOOLTIPS;
  public readonly EVENT_PARAM3_TOOLTIPS = EVENT_PARAM3_TOOLTIPS;
  public readonly EVENT_PARAM4_TOOLTIPS = EVENT_PARAM4_TOOLTIPS;
  public readonly EVENT_PARAM5_TOOLTIPS = EVENT_PARAM5_TOOLTIPS;
  public readonly ACTION_PARAM1_TOOLTIPS = ACTION_PARAM1_TOOLTIPS;
  public readonly ACTION_PARAM2_TOOLTIPS = ACTION_PARAM2_TOOLTIPS;
  public readonly ACTION_PARAM3_TOOLTIPS = ACTION_PARAM3_TOOLTIPS;
  public readonly ACTION_PARAM4_TOOLTIPS = ACTION_PARAM4_TOOLTIPS;
  public readonly ACTION_PARAM5_TOOLTIPS = ACTION_PARAM5_TOOLTIPS;
  public readonly ACTION_PARAM6_TOOLTIPS = ACTION_PARAM6_TOOLTIPS;
  public readonly TARGET_PARAM1_TOOLTIPS = TARGET_PARAM1_TOOLTIPS;
  public readonly TARGET_PARAM2_TOOLTIPS = TARGET_PARAM2_TOOLTIPS;
  public readonly TARGET_PARAM3_TOOLTIPS = TARGET_PARAM3_TOOLTIPS;
  public readonly TARGET_PARAM4_TOOLTIPS = TARGET_PARAM4_TOOLTIPS;

  get selectedEvent(): number {
    return this.editorService.form.get('event_type').value;
  }

  get selectedAction(): number {
    return this.editorService.form.get('action_type').value;
  }

  get selectedTarget(): number {
    return this.editorService.form.get('target_type').value;
  }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: SaiEditorService,
    protected handlerService: SaiHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

