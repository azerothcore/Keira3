import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { SAI_TYPES, SmartScripts } from '@keira-types/smart-scripts.type';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { SubscriptionHandler } from '../../../utils/subscription-handler/subscription-handler';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sai-top-bar',
  templateUrl: './sai-top-bar.component.html',
})
export class SaiTopBarComponent extends SubscriptionHandler implements OnInit {
  @Input({ required: true }) selected: string;
  @Input({ required: true }) selectedName: string;
  @Input({ required: true }) isNew: boolean;

  private _selectedText: string;

  get selectedText() {
    return this._selectedText;
  }

  constructor(public queryService: MysqlQueryService) {
    super();
  }

  async ngOnInit() {
    const selected: Partial<SmartScripts> = JSON.parse(this.selected);

    switch (selected.source_type) {
      case SAI_TYPES.SAI_TYPE_CREATURE:
        this._selectedText = `Creature ${this.getGuidOrIdText(selected.entryorguid)}`;
        this._selectedText = `${this._selectedText} (${this.selectedName})`;
        break;

      case SAI_TYPES.SAI_TYPE_GAMEOBJECT:
        this._selectedText = `Gameobject ${this.getGuidOrIdText(selected.entryorguid)}`;
        this._selectedText = `${this._selectedText} (${this.selectedName})`;
        break;

      case SAI_TYPES.SAI_TYPE_AREATRIGGER:
        this._selectedText = `Areatrigger ID ${selected.entryorguid}`;
        break;

      case SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST:
        this._selectedText = `Timed Actionlist ID ${selected.entryorguid}`;
        this._selectedText = `${this._selectedText} (${this.selectedName})`;
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
