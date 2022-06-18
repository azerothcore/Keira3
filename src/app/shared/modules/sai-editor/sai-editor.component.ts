import { Component, OnInit } from '@angular/core';
import { MultiRowEditorComponent } from '../../abstract/components/editors/multi-row-editor.component';
import { EVENT_PHASE_MASK } from '../../constants/flags/event-phase-mask';
import { SMART_EVENT_FLAGS } from '../../constants/flags/smart-event-flags';
import { SAI_TYPES, SmartScripts } from '../../types/smart-scripts.type';
import {
  SAI_ACTIONS,
  SAI_ACTIONS_KEYS,
  SAI_ACTION_PARAM1_NAMES,
  SAI_ACTION_PARAM1_TOOLTIPS,
  SAI_ACTION_PARAM2_NAMES,
  SAI_ACTION_PARAM2_TOOLTIPS,
  SAI_ACTION_PARAM3_NAMES,
  SAI_ACTION_PARAM3_TOOLTIPS,
  SAI_ACTION_PARAM4_NAMES,
  SAI_ACTION_PARAM4_TOOLTIPS,
  SAI_ACTION_PARAM5_NAMES,
  SAI_ACTION_PARAM5_TOOLTIPS,
  SAI_ACTION_PARAM6_NAMES,
  SAI_ACTION_PARAM6_TOOLTIPS,
  SAI_ACTION_TOOLTIPS,
} from './constants/sai-actions';
import {
  SAI_EVENTS,
  SAI_EVENTS_KEYS,
  SAI_EVENT_PARAM1_NAMES,
  SAI_EVENT_PARAM1_TOOLTIPS,
  SAI_EVENT_PARAM2_NAMES,
  SAI_EVENT_PARAM2_TOOLTIPS,
  SAI_EVENT_PARAM3_NAMES,
  SAI_EVENT_PARAM3_TOOLTIPS,
  SAI_EVENT_PARAM4_NAMES,
  SAI_EVENT_PARAM4_TOOLTIPS,
  SAI_EVENT_PARAM5_NAMES,
  SAI_EVENT_PARAM5_TOOLTIPS,
  SAI_EVENT_TOOLTIPS,
} from './constants/sai-event';
import {
  SAI_TARGETS,
  SAI_TARGETS_KEYS,
  SAI_TARGET_O_NAMES,
  SAI_TARGET_O_TOOLTIPS,
  SAI_TARGET_PARAM1_NAMES,
  SAI_TARGET_PARAM1_TOOLTIPS,
  SAI_TARGET_PARAM2_NAMES,
  SAI_TARGET_PARAM2_TOOLTIPS,
  SAI_TARGET_PARAM3_NAMES,
  SAI_TARGET_PARAM3_TOOLTIPS,
  SAI_TARGET_PARAM4_NAMES,
  SAI_TARGET_PARAM4_TOOLTIPS,
  SAI_TARGET_TOOLTIPS,
  SAI_TARGET_X_NAMES,
  SAI_TARGET_X_TOOLTIPS,
  SAI_TARGET_Y_NAMES,
  SAI_TARGET_Y_TOOLTIPS,
  SAI_TARGET_Z_NAMES,
  SAI_TARGET_Z_TOOLTIPS,
} from './constants/sai-targets';
import { SaiEditorService } from './sai-editor.service';
import { SaiHandlerService } from './sai-handler.service';

@Component({
  selector: 'keira-sai-editor',
  templateUrl: './sai-editor.component.html',
  styleUrls: ['./sai-editor.component.scss'],
})
export class SaiEditorComponent extends MultiRowEditorComponent<SmartScripts> implements OnInit {
  public readonly EVENT_PHASE_MASK = EVENT_PHASE_MASK;
  public readonly SMART_EVENT_FLAGS = SMART_EVENT_FLAGS;
  public readonly SAI_EVENTS = SAI_EVENTS;
  public readonly SAI_EVENTS_KEYS = SAI_EVENTS_KEYS;
  public readonly SAI_ACTIONS = SAI_ACTIONS;
  public readonly SAI_ACTIONS_KEYS = SAI_ACTIONS_KEYS;
  public readonly SAI_TARGETS = SAI_TARGETS;
  public readonly SAI_TARGETS_KEYS = SAI_TARGETS_KEYS;
  public readonly SAI_EVENT_TOOLTIPS = SAI_EVENT_TOOLTIPS;
  public readonly SAI_ACTION_TOOLTIPS = SAI_ACTION_TOOLTIPS;
  public readonly SAI_TARGET_TOOLTIPS = SAI_TARGET_TOOLTIPS;
  public readonly EVENT_PARAM1_NAMES = SAI_EVENT_PARAM1_NAMES;
  public readonly EVENT_PARAM2_NAMES = SAI_EVENT_PARAM2_NAMES;
  public readonly EVENT_PARAM3_NAMES = SAI_EVENT_PARAM3_NAMES;
  public readonly EVENT_PARAM4_NAMES = SAI_EVENT_PARAM4_NAMES;
  public readonly EVENT_PARAM5_NAMES = SAI_EVENT_PARAM5_NAMES;
  public readonly ACTION_PARAM1_NAMES = SAI_ACTION_PARAM1_NAMES;
  public readonly ACTION_PARAM2_NAMES = SAI_ACTION_PARAM2_NAMES;
  public readonly ACTION_PARAM3_NAMES = SAI_ACTION_PARAM3_NAMES;
  public readonly ACTION_PARAM4_NAMES = SAI_ACTION_PARAM4_NAMES;
  public readonly ACTION_PARAM5_NAMES = SAI_ACTION_PARAM5_NAMES;
  public readonly ACTION_PARAM6_NAMES = SAI_ACTION_PARAM6_NAMES;
  public readonly TARGET_PARAM1_NAMES = SAI_TARGET_PARAM1_NAMES;
  public readonly TARGET_PARAM2_NAMES = SAI_TARGET_PARAM2_NAMES;
  public readonly TARGET_PARAM3_NAMES = SAI_TARGET_PARAM3_NAMES;
  public readonly TARGET_PARAM4_NAMES = SAI_TARGET_PARAM4_NAMES;
  public readonly TARGET_X_NAMES = SAI_TARGET_X_NAMES;
  public readonly TARGET_Y_NAMES = SAI_TARGET_Y_NAMES;
  public readonly TARGET_Z_NAMES = SAI_TARGET_Z_NAMES;
  public readonly TARGET_O_NAMES = SAI_TARGET_O_NAMES;
  public readonly EVENT_PARAM1_TOOLTIPS = SAI_EVENT_PARAM1_TOOLTIPS;
  public readonly EVENT_PARAM2_TOOLTIPS = SAI_EVENT_PARAM2_TOOLTIPS;
  public readonly EVENT_PARAM3_TOOLTIPS = SAI_EVENT_PARAM3_TOOLTIPS;
  public readonly EVENT_PARAM4_TOOLTIPS = SAI_EVENT_PARAM4_TOOLTIPS;
  public readonly EVENT_PARAM5_TOOLTIPS = SAI_EVENT_PARAM5_TOOLTIPS;
  public readonly ACTION_PARAM1_TOOLTIPS = SAI_ACTION_PARAM1_TOOLTIPS;
  public readonly ACTION_PARAM2_TOOLTIPS = SAI_ACTION_PARAM2_TOOLTIPS;
  public readonly ACTION_PARAM3_TOOLTIPS = SAI_ACTION_PARAM3_TOOLTIPS;
  public readonly ACTION_PARAM4_TOOLTIPS = SAI_ACTION_PARAM4_TOOLTIPS;
  public readonly ACTION_PARAM5_TOOLTIPS = SAI_ACTION_PARAM5_TOOLTIPS;
  public readonly ACTION_PARAM6_TOOLTIPS = SAI_ACTION_PARAM6_TOOLTIPS;
  public readonly TARGET_PARAM1_TOOLTIPS = SAI_TARGET_PARAM1_TOOLTIPS;
  public readonly TARGET_PARAM2_TOOLTIPS = SAI_TARGET_PARAM2_TOOLTIPS;
  public readonly TARGET_PARAM3_TOOLTIPS = SAI_TARGET_PARAM3_TOOLTIPS;
  public readonly TARGET_PARAM4_TOOLTIPS = SAI_TARGET_PARAM4_TOOLTIPS;
  public readonly TARGET_X_TOOLTIPS = SAI_TARGET_X_TOOLTIPS;
  public readonly TARGET_Y_TOOLTIPS = SAI_TARGET_Y_TOOLTIPS;
  public readonly TARGET_Z_TOOLTIPS = SAI_TARGET_Z_TOOLTIPS;
  public readonly TARGET_O_TOOLTIPS = SAI_TARGET_O_TOOLTIPS;

  get selectedEvent(): number {
    return this.editorService.form.controls.event_type.value;
  }

  get selectedAction(): number {
    return this.editorService.form.controls.action_type.value;
  }

  get selectedTarget(): number {
    return this.editorService.form.controls.target_type.value;
  }

  get isTimedActionlists(): boolean {
    return this.handlerService.parsedSelected.source_type === SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST;
  }

  get showTimedActionlists(): boolean {
    return (
      this.handlerService.parsedSelected.source_type === SAI_TYPES.SAI_TYPE_CREATURE && this.handlerService.parsedSelected.entryorguid > 0
    );
  }

  get entryOrGuid(): number {
    return this.handlerService.parsedSelected.entryorguid;
  }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: SaiEditorService, protected handlerService: SaiHandlerService) {
    super(editorService, handlerService);
  }

  getName(defaultParamName: string, value: string | undefined): string {
    return value ? value : defaultParamName;
  }

  getHandler(): SaiHandlerService {
    return this.handlerService;
  }
}
