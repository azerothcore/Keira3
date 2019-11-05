import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { TableRow } from '../../types/general';
import { SubscriptionHandler } from '../../utils/subscription-handler/subscription-handler';

export abstract class HandlerService<T extends TableRow> extends SubscriptionHandler implements CanActivate {
  protected _selected: string;
  selectedName: string;
  isNew = false;

  get selected(): string { return this._selected; }

  constructor(
    protected mainEditorRoutePath: string,
    protected router: Router,
  ) {
    super();
  }

  select(isNew: boolean, id: string|number|Partial<T>, name?: string) {
    this.isNew = isNew;

    if (typeof id === 'object') {
      this._selected = JSON.stringify(id);
    } else {
      this._selected = `${id}`;
    }

    this.selectedName = name;

    this.router.navigate([this.mainEditorRoutePath]);
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!!this._selected) {
      return true;
    }

    this.router.navigate(['/']);
    return false;
  }
}
