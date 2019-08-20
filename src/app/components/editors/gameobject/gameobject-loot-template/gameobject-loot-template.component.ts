import { Component } from '@angular/core';

import { GameobjectHandlerService } from '../../../../services/handlers/gameobject-handler.service';
import { GameobjectLootTemplate } from '../../../../types/gameobject-loot-template.type';
import { GameobjectLootTemplateService } from '../../../../services/editors/gameobject/gameobject-loot-template.service';
import { LootTemplateComponent } from '../../shared/loot-template/loot-template.component';
import { MysqlError } from 'mysql';

@Component({
  selector: 'app-gameobject-loot-template',
  templateUrl: './gameobject-loot-template.component.html',
  styleUrls: ['./gameobject-loot-template.component.scss']
})
export class GameobjectLootTemplateComponent extends LootTemplateComponent<GameobjectLootTemplate> {

  private _type: number;
  get type(): number { return this._type; }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: GameobjectLootTemplateService,
    public handlerService: GameobjectHandlerService,
  ) {
    super(editorService, handlerService);
  }

  ngOnInit() {

    this.subscriptions.push(
      this.editorService.getType().subscribe((data) => {

        // always re-check the 'type'
        this._type = data.results[0].type;

      }, (error: MysqlError) => {
        console.error(error);
      })
    );

    this.subscriptions.push(
      this.editorService.getLootId().subscribe((data) => {
        // always re-check the lootId
        this._lootId = data.results[0].lootId;

        if (this._lootId !== 0) {
          // the lootId is correctly set

          if (this.editorService.loadedEntityId !== `${this._lootId}`) {
            // the rows haven't been loaded or the lootId has changed
            this.editorService.reload(this._lootId);
          }
        }
      }, (error: MysqlError) => {
        console.error(error);
      })
    );
  }
}
