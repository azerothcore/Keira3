/* istanbul ignore file */ // TODO: fix coverage
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { QueryError } from 'mysql2';

import { LootTemplate } from '@keira/shared/acore-world-model';
import { HandlerService } from '../../../service/handlers/handler.service';
import { LootEditorIdService } from '../../../service/editors/loot-editor-id.service';
import { LootTemplateComponent } from './loot-template.component';

// Extended only by the loot tables that require a template loot id
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export abstract class LootTemplateIdComponent<T extends LootTemplate> extends LootTemplateComponent<T> implements OnInit {
  public abstract editorService: LootEditorIdService<T>;
  protected abstract handlerService: HandlerService<T>;

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

  ngOnInit() {
    this.editorService.clearCache();
    this.checkTemplateLootId();
    this.watchFormForChanges();
  }
}
