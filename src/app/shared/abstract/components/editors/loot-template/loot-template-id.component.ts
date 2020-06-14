import { OnInit } from '@angular/core';
import { MysqlError } from 'mysql';

import { LootTemplate } from '@keira-types/loot-template.type';
import { HandlerService } from '../../../service/handlers/handler.service';
import { LootEditorIdService } from '../../../service/editors/loot-editor-id.service';
import { LootTemplateComponent } from '@keira-abstract/components/editors/loot-template/loot-template.component';

// Extended only by the loot tables that require a template loot id
export abstract class LootTemplateIdComponent<T extends LootTemplate> extends LootTemplateComponent<T> implements OnInit {

  protected _lootId: number;
  get lootId(): number { return this._lootId; }

  protected checkTemplateLootId() {
    this.subscriptions.push(
      this.editorService.getLootId().subscribe((data) => {
        // always re-check the lootId
        this._lootId = data[0].lootId;

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

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: LootEditorIdService<T>,
    protected handlerService: HandlerService<T>,
  ) {
    super(editorService, handlerService);
  }

  ngOnInit() {
    this.editorService.clearCache();
    this.checkTemplateLootId();
  }
}
