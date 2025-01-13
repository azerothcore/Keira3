import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TableRow } from '@keira/shared/constants';
import { SubscriptionHandler } from '@keira/shared/utils';

export abstract class HandlerService<T extends TableRow> extends SubscriptionHandler {
  protected readonly router = inject(Router);

  private _customItemScssClass: string = '';
  protected _selected!: string;

  selectedName!: string;
  isNew = false;
  forceReload = false;

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
  get parsedSelected(): { entryorguid: number; source_type: number } {
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

  set ItemQualityScssClass(quality: number) {
    this._customItemScssClass = `item-quality-q${quality || '0'}`;
  }

  get itemQualityScssClass(): string {
    return this._customItemScssClass;
  }

  select(isNew: boolean, id: string | number | Partial<T>, name?: string, navigate = true) {
    this.resetStatus();
    this.isNew = isNew;

    const currentSelected = this._selected;

    if (typeof id === 'object') {
      this._selected = JSON.stringify(id);
    } else {
      this._selected = `${id}`;
    }

    // To prevent side effects or outdated data, it's essential to reload the entity when the user selects it again
    if (currentSelected === this._selected) {
      this.forceReload = true;
    }

    this.selectedName = name as string;

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
