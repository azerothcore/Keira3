import { Service, Signal, signal } from '@angular/core';
import { ComplexKeyHandlerService } from '@keira/shared/base-abstract-classes';
import { Conditions, CONDITIONS_TABLE } from '@keira/shared/acore-world-model';
import { CONDITIONS_SOURCE_FIELDS } from './conditions-source-query';

/** The source (SourceType, SourceGroup, SourceEntry, SourceId) whose conditions are edited together (#3154). */
@Service()
export class ConditionsSourceHandlerService extends ComplexKeyHandlerService<Conditions> {
  protected readonly mainEditorRoutePath = 'conditions/source';
  protected readonly idFields = CONDITIONS_SOURCE_FIELDS as string[];

  get isConditionsSourceUnsaved(): Signal<boolean> {
    return this.statusMap[CONDITIONS_TABLE].asReadonly();
  }

  protected _statusMap = {
    [CONDITIONS_TABLE]: signal(false),
  };
}
