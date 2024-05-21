import { HandlerService } from './handler.service';
import { getPartial } from '@keira/shared/utils';
import { TableRow } from '@keira/shared/constants';

export abstract class ComplexKeyHandlerService<T extends TableRow> extends HandlerService<T> {
  protected abstract readonly idFields: string[];

  /* istanbul ignore next */ // TODO: fix coverage
  override select(isNew: boolean, id: Partial<T>, name = undefined, navigate = true) {
    super.select(isNew, this.getIdObject(id), name, navigate);
  }

  private getIdObject(input: Partial<T> | T): Partial<T> {
    return getPartial<T>(input, this.idFields);
  }
}
