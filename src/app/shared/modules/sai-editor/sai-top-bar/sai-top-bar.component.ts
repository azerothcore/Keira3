import { Component, Input, OnInit } from '@angular/core';

import { SaiHandlerService } from '../sai-handler.service';
import { SAI_TYPES, SmartScripts } from '@keira-types/smart-scripts.type';
import { QueryService } from '../../../services/query.service';
import { SubscriptionHandler } from '../../../utils/subscription-handler/subscription-handler';

@Component({
  selector: 'app-sai-top-bar',
  templateUrl: './sai-top-bar.component.html',
})
export class SaiTopBarComponent extends SubscriptionHandler implements OnInit {

  @Input() public handler: SaiHandlerService;

  private _selectedText: string;

  get selectedText() {
    return this._selectedText;
  }

  constructor(
    public queryService: QueryService,
  ) {
    super();
  }

  ngOnInit(): void {
    const selected: Partial<SmartScripts> = JSON.parse(this.handler.selected);

    switch (selected.source_type) {

      case SAI_TYPES.SAI_TYPE_CREATURE:
        this._selectedText = `Creature ${this.getGuidOrIdText(selected.entryorguid)}`;
        this.appendCreatureName(selected.entryorguid);
        break;

      case SAI_TYPES.SAI_TYPE_GAMEOBJECT:
        this._selectedText = `Gameobject ${this.getGuidOrIdText(selected.entryorguid)}`;
        break;

      case SAI_TYPES.SAI_TYPE_AREATRIGGER:
        this._selectedText = `Areatrigger ID ${selected.entryorguid}`;
        break;

      case SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST:
        this._selectedText = `Timed Actionlist ID ${selected.entryorguid}`;
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

  private appendCreatureName(entryorguid: number): void {
    let query: string;

    if (entryorguid < 0) {
      query = `SELECT ct.name FROM creature_template AS ct INNER JOIN creature AS c ON c.id = ct.entry WHERE c.guid = ${-entryorguid}`;
    } else {
      query = `SELECT name FROM creature_template WHERE entry = ${entryorguid}`;
    }

    this.subscriptions.push(
      this.queryService.query<{ name: string }>(query).subscribe((data) => {
        if (data.results.length > 0) {
          this._selectedText = `${this._selectedText} (${data.results[0].name})`;
        } else {
          console.error(`Unable to find creature having entryorguid = ${entryorguid}`);
        }
      })
    );
  }
}
