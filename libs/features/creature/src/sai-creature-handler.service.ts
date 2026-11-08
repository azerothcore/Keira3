import { Service } from '@angular/core';
import { SaiHandlerService } from '@keira/shared/sai-editor';

@Service()
export class SaiCreatureHandlerService extends SaiHandlerService {
  /** (its tabs are Creature's: each creature tab keeps its own SmartAI) */
  readonly tabSection = 'creature';
}
