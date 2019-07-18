import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { TableRow } from '../../types/general';
import { Observable } from 'rxjs';

export abstract class HandlerService<T extends TableRow> implements CanActivate {
  private _selected: string;
  selectedName: string;
  isNew = false;

  get selected(): string { return this._selected; }

  constructor(
    private mainEditorRoutePath: string,
    protected router: Router,
  ) {}

  select(isNew: boolean, id: string|number, name?: string) {
    this.isNew = isNew;
    this._selected = `${id}`;
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
