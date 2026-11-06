import { Service, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import {
  AREATRIGGER_TELEPORT_TABLE,
  AREATRIGGER_TAVERN_TABLE,
  AREATRIGGER_INVOLVEDRELATION_TABLE,
  AREATRIGGER_SCRIPTS_TABLE,
  AREATRIGGER_TABLE,
  AreatriggerTeleport,
} from '@keira/shared/acore-world-model';

/** An area trigger (AreaTrigger.dbc id): its teleport, rest area, quest objective, script and custom shape. */
@Service()
export class AreaTriggerHandlerService extends HandlerService<AreatriggerTeleport> {
  protected readonly mainEditorRoutePath = 'area-triggers/areatrigger-teleport';

  get isAreatriggerTeleportUnsaved(): Signal<boolean> {
    return this.statusMap[AREATRIGGER_TELEPORT_TABLE].asReadonly();
  }

  get isAreatriggerTavernUnsaved(): Signal<boolean> {
    return this.statusMap[AREATRIGGER_TAVERN_TABLE].asReadonly();
  }

  get isAreatriggerInvolvedrelationUnsaved(): Signal<boolean> {
    return this.statusMap[AREATRIGGER_INVOLVEDRELATION_TABLE].asReadonly();
  }

  get isAreatriggerScriptsUnsaved(): Signal<boolean> {
    return this.statusMap[AREATRIGGER_SCRIPTS_TABLE].asReadonly();
  }

  get isAreatriggerUnsaved(): Signal<boolean> {
    return this.statusMap[AREATRIGGER_TABLE].asReadonly();
  }

  protected _statusMap = {
    [AREATRIGGER_TELEPORT_TABLE]: signal(false),
    [AREATRIGGER_TAVERN_TABLE]: signal(false),
    [AREATRIGGER_INVOLVEDRELATION_TABLE]: signal(false),
    [AREATRIGGER_SCRIPTS_TABLE]: signal(false),
    [AREATRIGGER_TABLE]: signal(false),
  };
}
