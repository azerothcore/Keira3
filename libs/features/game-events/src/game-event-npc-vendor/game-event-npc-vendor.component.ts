import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GameEventNpcVendor } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { GameEventHandlerService } from '../game-event-handler.service';
import { GameEventNpcVendorService } from './game-event-npc-vendor.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-game-event-npc-vendor',
  templateUrl: './game-event-npc-vendor.component.html',
  imports: [
    TopBarComponent,
    TranslateDirective,
    TranslatePipe,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    EditorButtonsComponent,
    NgxDatatableModule,
  ],
})
export class GameEventNpcVendorComponent extends MultiRowEditorComponent<GameEventNpcVendor> {
  protected override readonly editorService = inject(GameEventNpcVendorService);
  readonly handlerService = inject(GameEventHandlerService);
}
