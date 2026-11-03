import { inject, Service } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  EVENT_SCRIPTS_ID,
  EVENT_SCRIPTS_ID_2,
  EVENT_SCRIPTS_ID_3,
  EVENT_SCRIPTS_TABLE,
  EventScripts,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { ModelForm } from '@keira/shared/utils';
import { EventScriptsHandlerService } from '../event-scripts-handler.service';

/** The steps of one event script; a step is told apart by delay, command, datalong, datalong2, dataint (the table has no key). */
@Service()
export class EventScriptsService extends MultiRowEditorService<EventScripts> {
  protected override readonly handlerService = inject(EventScriptsHandlerService);
  protected override readonly _entityClass = EventScripts;
  protected override readonly _entityTable = EVENT_SCRIPTS_TABLE;
  protected override readonly _entityIdField = EVENT_SCRIPTS_ID;
  protected override readonly _entitySecondIdField = EVENT_SCRIPTS_ID_2;
  protected override readonly _entityExtraIdField = EVENT_SCRIPTS_ID_3;

  constructor() {
    super();
    this.init();
  }

  protected override getNewRowId(row: EventScripts): string {
    return `${row.delay}_${row.command}_${row.datalong}_${row.datalong2}_${row.dataint}`;
  }

  protected override getNewRowIdForm(controls: FormGroup<ModelForm<EventScripts>>['controls']): string {
    return `${controls.delay.value}_${controls.command.value}_${controls.datalong.value}_${controls.datalong2.value}_${controls.dataint.value}`;
  }
}
