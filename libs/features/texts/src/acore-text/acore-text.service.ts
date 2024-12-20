import { Injectable } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { AcoreTextHandlerService } from './acore-text-handler.service';
import { ACORE_STRING_DEFAULT, ACORE_STRING_ENTRY, ACORE_STRING_TABLE, AcoreString } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class AcoreTextService extends SingleRowEditorService<AcoreString> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override handlerService: AcoreTextHandlerService) {
    super(AcoreString, ACORE_STRING_TABLE, ACORE_STRING_ENTRY, ACORE_STRING_DEFAULT, true, handlerService);
  }
}
