import { TableRow } from '@keira-types/general';
import { HandlerService } from '../../service/handlers/handler.service';
import { EditorComponent } from './editor.component';
import { MultiRowEditorService } from '../../service/editors/multi-row-editor.service';
import { DTCFG } from '@keira-config/datatable.config';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
  template: '',
}))
export abstract class MultiRowEditorComponent<T extends TableRow> extends EditorComponent<T> {
  readonly DTCFG = DTCFG;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: MultiRowEditorService<T>, protected handlerService: HandlerService<T>) {
    super(editorService, handlerService);
  }
}
