import { Component, OnInit } from '@angular/core';
import { MysqlError } from 'mysql';

import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectLootTemplate } from '@keira-types/gameobject-loot-template.type';
import { GameobjectLootTemplateService } from './gameobject-loot-template.service';
import { LootTemplateIdComponent } from '@keira-abstract/components/editors/loot-template/loot-template-id.component';

@Component({
  selector: 'keira-gameobject-loot-template',
  templateUrl: './gameobject-loot-template.component.html',
})
export class GameobjectLootTemplateComponent extends LootTemplateIdComponent<GameobjectLootTemplate> implements OnInit {

  private _type: number;
  get type(): number { return this._type; }

  checkTemplateType() {
    this.subscriptions.push(
      this.editorService.getType().subscribe((data) => {

        // always re-check the 'type'
        this._type = data[0].type;

      }, (error: MysqlError) => {
        console.error(error);
      })
    );
  }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: GameobjectLootTemplateService,
    public handlerService: GameobjectHandlerService,
  ) {
    super(editorService, handlerService);
  }

  ngOnInit() {
    this.editorService.clearCache();
    this.checkTemplateType();
    this.checkTemplateLootId();
  }
}
