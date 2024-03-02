import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { QueryError } from 'mysql2';

import { LootTemplate } from '@keira/acore-world-model';
import { HandlerService } from '../../../service/handlers/handler.service';
import { LootEditorIdService } from '../../../service/editors/loot-editor-id.service';
import { LootTemplateComponent } from '@keira-abstract/components/editors/loot-template/loot-template.component';

// Extended only by the loot tables that require a template loot id
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export abstract class LootTemplateIdComponent<T extends LootTemplate> extends LootTemplateComponent<T> implements OnInit {
  protected _lootId: number;
  get lootId(): number {
    return this._lootId;
  }

  protected checkTemplateLootId() {
    this.subscriptions.push(
      this.editorService.getLootId().subscribe({
        next: (data) => {
          // always re-check the lootId
          this._lootId = data[0].lootId;

          if (this._lootId !== 0) {
            // the lootId is correctly set

            if (this.editorService.loadedEntityId !== `${this._lootId}`) {
              // the rows haven't been loaded or the lootId has changed
              this.editorService.reload(this.changeDetectorRef, this._lootId);
            }
          }
          this.changeDetectorRef.markForCheck();
        },
        error: (error: QueryError) => {
          console.error(error);
        },
      }),
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
    this.watchFormForChanges();
  }
}
