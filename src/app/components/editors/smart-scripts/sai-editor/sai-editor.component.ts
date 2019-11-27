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

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: SaiEditorService,
    protected handlerService: SaiHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

