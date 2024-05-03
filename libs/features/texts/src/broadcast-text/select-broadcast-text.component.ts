import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { BroadcastText, BROADCAST_TEXT_CUSTOM_STARTING_ID, BROADCAST_TEXT_TABLE, BROADCAST_TEXT_ID } from '@keira/shared/acore-world-model';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { SelectBroadcastTextService } from './select-broadcast-text.service';
import { BroadcastTextHandlerService } from './broadcast-text-handler.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-broadcast-text.component.html',
  standalone: true,
  imports: [
    TopBarComponent,
    CreateComponent,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    HighlightjsWrapperComponent,
    NgxDatatableModule,
  ],
})
export class SelectBroadcastTextComponent extends SelectComponent<BroadcastText> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public readonly selectService: SelectBroadcastTextService,
    public readonly handlerService: BroadcastTextHandlerService,
  ) {
    super(BROADCAST_TEXT_TABLE, BROADCAST_TEXT_ID, BROADCAST_TEXT_CUSTOM_STARTING_ID, selectService, handlerService);
  }
}
