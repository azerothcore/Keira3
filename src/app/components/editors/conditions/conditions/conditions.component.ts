import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '../../shared/single-row-editor.component';
import { ConditionsHandlerService } from '../../../../services/handlers/conditions-handler.service';
import { Conditions } from '../../../../types/conditions.type';
import { ConditionsService } from '../../../../services/editors/conditions/conditions.service';

@Component({
  selector: 'app-conditions',
  templateUrl: './conditions.component.html',
})
export class ConditionsComponent extends SingleRowEditorComponent<Conditions> {

  // TODO: this is temporary, remove it later
  public keys = [];

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ConditionsService,
    public handlerService: ConditionsHandlerService,
  ) {
    super(editorService, handlerService);

    // TODO: this is temporary, remove it later
    const tmpObj = new Conditions();
    for (const key in tmpObj) {
      if (tmpObj.hasOwnProperty(key)) {
        this.keys.push(key);
      }
    }
  }
}
