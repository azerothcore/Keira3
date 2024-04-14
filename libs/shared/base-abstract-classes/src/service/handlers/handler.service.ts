import { Router } from '@angular/router';
import { TableRow } from '@keira/shared/constants';
import { SubscriptionHandler } from '@keira/shared/utils';
import { inject } from '@angular/core';

export abstract class HandlerService<T extends TableRow> extends SubscriptionHandler {
  protected readonly router = inject(Router);

  protected _selected: string;
  selectedName: string;
  isNew = false;

  protected abstract _statusMap: { [key: string]: boolean };
  protected abstract readonly mainEditorRoutePath: string;

  /* istanbul ignore next */ // TODO: fix coverage
  get statusMap(): { [key: string]: boolean } {
    return this._statusMap;
  }

  get selected(): string {
    return this._selected;
  }

  /* istanbul ignore next */ // TODO: fix coverage
  get parsedSelected(): Partial<T> {
    return JSON.parse(this.selected);
  }

  private resetStatus(): void {
    /* istanbul ignore next */ // not reachable under normal circumstances
    if (!this._statusMap) {
      return; // prevent test error: TypeError: Cannot convert undefined or null to object
    }

    /* istanbul ignore next */ // TODO: fix coverage
    for (const key of Object.keys(this._statusMap)) {
      this._statusMap[key] = false;
    }
  }

  select(isNew: boolean, id: string | number | Partial<T>, name?: string, navigate = true) {
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

  canActivate(): boolean {
    if (!!this._selected) {
      return true;
    }

    this.router.navigate(['/']);
    return false;
  }
}
