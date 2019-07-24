import { OnInit } from '@angular/core';
import { MysqlError } from 'mysql';

import { LootTemplate } from './loot-template.type';
import { MultiRowEditorComponent } from '../multi-row-editor.component';
import { HandlerService } from '../../../../services/handlers/handler.service';
import { LootEditorService } from '../../../../services/editors/loot-editor.service';
import { LOOT_MODE } from '../../../../constants/flags/loot-mode';

export abstract class LootTemplateComponent<T extends LootTemplate> extends MultiRowEditorComponent<T> implements OnInit {

  public readonly LOOT_MODE = LOOT_MODE;

  private _lootId: number;
  get lootId(): number { return this._lootId; }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: LootEditorService<T>,
    protected handlerService: HandlerService<T>,
  ) {
    super(editorService, handlerService);
  }

  ngOnInit() {
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
