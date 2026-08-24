import { TableRow } from '@keira/shared/constants';
import { SingleRowEditorService } from '../../service/editors/single-row-editor.service';
import { HandlerService } from '../../service/handlers/handler.service';
import { EditorComponent } from './editor.component';
import { Directive } from '@angular/core';

@Directive()
export abstract class SingleRowEditorComponent<T extends TableRow> extends EditorComponent<T> {
  protected abstract override readonly editorService: SingleRowEditorService<T>;
  protected abstract override readonly handlerService: HandlerService<T>;
}
