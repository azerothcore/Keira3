import { Component, Input, OnInit } from '@angular/core';

import { SaiHandlerService } from '../sai-handler.service';
import { SAI_TYPES, SmartScripts } from '@keira-types/smart-scripts.type';
import { MysqlQueryService } from '../../../services/mysql-query.service';
import { SubscriptionHandler } from '../../../utils/subscription-handler/subscription-handler';

@Component({
  selector: 'keira-sai-top-bar',
  templateUrl: './sai-top-bar.component.html',
})
export class SaiTopBarComponent extends SubscriptionHandler implements OnInit {

  @Input() public handler: SaiHandlerService;

  private _selectedText: string;

  get selectedText() {
    return this._selectedText;
  }

  constructor(
    public queryService: MysqlQueryService,
  ) {
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
