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
  public abstract override readonly editorService: MultiRowEditorService<T>;
  protected abstract override readonly handlerService: HandlerService<T>;

  readonly DTCFG = DTCFG;
}
