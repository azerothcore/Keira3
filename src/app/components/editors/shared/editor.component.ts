import { TableRow } from '../../../types';
import { WIKI_BASE_URL } from '../../../constants';
import { HandlerService } from '../../../services/handlers/handler.service';
import { EditorService } from '../../../services/editors/editor.service';

export abstract class EditorComponent<T extends TableRow> {
  public readonly WIKI_BASE_URL = WIKI_BASE_URL;
  public get docUrl() {
    return this.WIKI_BASE_URL + this.editorService.entityTable;
  }

  constructor(
    public editorService: EditorService<T>,
    protected handlerService: HandlerService<T>,
  ) { }
}
