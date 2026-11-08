import { Service } from '@angular/core';
import { SaiHandlerService } from '@keira/shared/sai-editor';

@Service()
export class SaiGameobjectHandlerService extends SaiHandlerService {
  /** (its tabs are Gameobject's: each gameobject tab keeps its own SmartAI) */
  readonly tabSection = 'gameobject';
}
