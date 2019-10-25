import { Router } from '@angular/router';

import { HandlerService } from './handler.service';
import { getPartial } from '../../utils/helpers';
import { TableRow } from '../../types/general';

export abstract class ComplexKeyHandlerService<T extends TableRow> extends HandlerService<T> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected mainEditorRoutePath: string,
    protected router: Router,
    protected idFields: string[],
  ) {
    super(
      mainEditorRoutePath,
      router,
    );
  }

  select(isNew: boolean, id: Partial<T>) {
    super.select(isNew, this.getIdObject(id));
  }

  private getIdObject(input: Partial<T> | T): Partial<T> {
    return getPartial<T>(input, this.idFields);
  }
}
