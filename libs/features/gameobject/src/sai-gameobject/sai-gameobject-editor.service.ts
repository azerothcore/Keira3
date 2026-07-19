import { Service, inject } from '@angular/core';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { SaiEditorService } from '@keira/shared/sai-editor';

@Service()
export class SaiGameobjectEditorService extends SaiEditorService {
  protected override readonly handlerService = inject(SaiGameobjectHandlerService);
}
