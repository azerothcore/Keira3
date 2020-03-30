import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { TableRow } from '@keira-types/general';
import { SubscriptionHandler } from '../../../utils/subscription-handler/subscription-handler';

export abstract class HandlerService<T extends TableRow> extends SubscriptionHandler implements CanActivate {
  protected _selected: string;
  selectedName: string;
  isNew = false;

  protected abstract _statusMap: {
    [key: string]: boolean;
  };
  get statusMap() {
    return this._statusMap;
  }

  get selected(): string { return this._selected; }

  get parsedSelected(): Partial<T> {
    return JSON.parse(this.selected);
  }

  constructor(
    protected mainEditorRoutePath: string,
    protected router: Router,
  ) {
    super();
  }

  private resetStatus() {
    for (const key of Object.keys(this._statusMap)) {
      this._statusMap[key] = false;
    }
  }

  select(isNew: boolean, id: string|number|Partial<T>, name?: string, navigate = true) {
    this.resetStatus();
    this.isNew = isNew;

    if (typeof id === 'object') {
      this._selected = JSON.stringify(id);
    } else {
      this._selected = `${id}`;
    }

    this.selectedName = name;

    if (navigate) {
      this.router.navigate([this.mainEditorRoutePath]);
    }
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!!this._selected) {
      return true;
    }

    this.router.navigate(['/']);
    return false;
  }
}
