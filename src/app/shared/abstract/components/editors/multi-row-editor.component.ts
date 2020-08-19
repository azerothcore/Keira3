import { TableRow } from '@keira-types/general';
import { HandlerService } from '../../service/handlers/handler.service';
import { EditorComponent } from './editor.component';
import { MultiRowEditorService } from '../../service/editors/multi-row-editor.service';
import { DTCFG } from '@keira-config/datatable.config';
import { Directive } from "@angular/core";

@Directive()
export abstract class MultiRowEditorComponent<T extends TableRow> extends EditorComponent<T> {

  public readonly DTCFG = DTCFG;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: MultiRowEditorService<T>,
    protected handlerService: HandlerService<T>,
  ) {
    super(editorService, handlerService);
  }
}
