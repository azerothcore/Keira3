import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { GameobjectLootTemplate } from '@keira/shared/acore-world-model';
import { LootTemplateIdComponent } from '@keira/shared/base-abstract-classes';
import { TopBarComponent } from '@keira/shared/base-editor-components';
import { LootEditorComponent } from '@keira/shared/loot-editor';
import { TranslateModule } from '@ngx-translate/core';
import { QueryError } from 'mysql2';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectLootTemplateService } from './gameobject-loot-template.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gameobject-loot-template',
  templateUrl: './gameobject-loot-template.component.html',
  imports: [TopBarComponent, TranslateModule, LootEditorComponent],
})
export class GameobjectLootTemplateComponent extends LootTemplateIdComponent<GameobjectLootTemplate> implements OnInit {
  private _type!: number;
  get type(): number {
    return this._type;
  }

  checkTemplateType() {
    this.subscriptions.push(
      this.editorService.getType().subscribe({
        next: (data) => {
          // always re-check the 'type'
          this._type = data[0].type;
        },
        error: (error: QueryError) => {
          console.error(error);
        },
      }),
    );
  }

  protected override readonly editorService = inject(GameobjectLootTemplateService);
  readonly handlerService = inject(GameobjectHandlerService);

  override ngOnInit() {
    this.editorService.clearCache();
    this.checkTemplateType();
    this.checkTemplateLootId();
    this.watchFormForChanges();
  }
}
