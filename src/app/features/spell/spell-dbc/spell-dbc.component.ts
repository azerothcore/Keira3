import { Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { SpellDbc } from '@keira-types/spell-dbc.type';
import { SpellDbcService } from './spell-dbc.service';
import { SpellHandlerService } from '../spell-handler.service';

@Component({
  selector: 'keira-spell-dbc',
  templateUrl: './spell-dbc.component.html',
})
export class SpellDbcComponent extends SingleRowEditorComponent<SpellDbc> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: SpellDbcService,
    public handlerService: SpellHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
