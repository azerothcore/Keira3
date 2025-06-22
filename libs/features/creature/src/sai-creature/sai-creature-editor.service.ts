import { Injectable, inject } from '@angular/core';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { SaiEditorService } from '@keira/shared/sai-editor';

@Injectable({
  providedIn: 'root',
})
export class SaiCreatureEditorService extends SaiEditorService {
  protected override readonly handlerService = inject(SaiCreatureHandlerService);
}
