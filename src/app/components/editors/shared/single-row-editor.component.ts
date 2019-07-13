import { TableRow } from '../../../types/general';
import { SingleRowEditorService } from '../../../services/editors/single-row-editor.service';
import { HandlerService } from '../../../services/handlers/handler.service';
import { EditorComponent } from './editor.component';

export abstract class SingleRowEditorComponent<T extends TableRow> extends EditorComponent<T> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: SingleRowEditorService<T>,
    protected handlerService: HandlerService<T>,
  ) {
    super(editorService, handlerService);
  }
}
