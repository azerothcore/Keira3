import { Service, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { EVENT_SCRIPTS_TABLE, EventScripts } from '@keira/shared/acore-world-model';

@Service()
export class EventScriptsHandlerService extends HandlerService<EventScripts> {
  protected readonly mainEditorRoutePath = 'db-scripts/event-scripts';

  get isEventScriptsUnsaved(): Signal<boolean> {
    return this.statusMap[EVENT_SCRIPTS_TABLE].asReadonly();
  }

  protected _statusMap = {
    [EVENT_SCRIPTS_TABLE]: signal(false),
  };
}
