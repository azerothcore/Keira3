import { TableRow } from '@keira/shared/constants';
import { HandlerService } from '../../service/handlers/handler.service';
import { EditorComponent } from './editor.component';
import { MultiRowEditorService } from '../../service/editors/multi-row-editor.service';
import { DTCFG } from '@keira/shared/config';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export abstract class MultiRowEditorComponent<T extends TableRow> extends EditorComponent<T> {
  readonly DTCFG = DTCFG;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: MultiRowEditorService<T>,
    protected handlerService: HandlerService<T>,
  ) {
    super(editorService, handlerService);
  }
}
