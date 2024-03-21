import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { SAI_TYPES, SmartScripts } from '@keira/shared/acore-world-model';
import { SaiHandlerService } from '../sai-handler.service';

import { SubscriptionHandler } from '@keira/shared/utils';
import { MysqlQueryService } from '@keira/shared/db-layer';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-sai-top-bar',
  templateUrl: './sai-top-bar.component.html',
  standalone: true,
  imports: [],
})
export class SaiTopBarComponent extends SubscriptionHandler implements OnInit {
  @Input() public handler: SaiHandlerService;

  private _selectedText: string;

  get selectedText() {
    return this._selectedText;
  }

  constructor(public queryService: MysqlQueryService) {
    super();
  }

  async ngOnInit() {
    const selected: Partial<SmartScripts> = JSON.parse(this.handler.selected);

    switch (selected.source_type) {
      case SAI_TYPES.SAI_TYPE_CREATURE:
        this._selectedText = `Creature ${this.getGuidOrIdText(selected.entryorguid)}`;
        this._selectedText = `${this._selectedText} (${await this.handler.getName().toPromise()})`;
        break;

      case SAI_TYPES.SAI_TYPE_GAMEOBJECT:
        this._selectedText = `Gameobject ${this.getGuidOrIdText(selected.entryorguid)}`;
        this._selectedText = `${this._selectedText} (${await this.handler.getName().toPromise()})`;
        break;

      case SAI_TYPES.SAI_TYPE_AREATRIGGER:
        this._selectedText = `Areatrigger ID ${selected.entryorguid}`;
        break;

      case SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST:
        this._selectedText = `Timed Actionlist ID ${selected.entryorguid}`;
        this._selectedText = `${this._selectedText} (${await this.handler.getName().toPromise()})`;
        break;
    }
  }

  private getGuidOrIdText(entryorguid: number): string {
    if (entryorguid < 0) {
      return `GUID ${-entryorguid}`;
    } else {
      return `ID ${entryorguid}`;
    }
  }
}
