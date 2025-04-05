import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { GOSSIP_MENU_CUSTOM_STARTING_ID, GOSSIP_MENU_ID, GOSSIP_MENU_TABLE, GossipMenu } from '@keira/shared/acore-world-model';
import { GossipHandlerService } from '../gossip-handler.service';
import { SelectGossipService } from './select-gossip.service';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { AsyncPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-gossip.component.html',
  styleUrls: ['./select-gossip.component.scss'],
  imports: [
    TopBarComponent,
    CreateComponent,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    HighlightjsWrapperComponent,
    NgxDatatableModule,
    AsyncPipe,
  ],
})
export class SelectGossipComponent extends SelectComponent<GossipMenu> {
  readonly entityTable = GOSSIP_MENU_TABLE;
  readonly entityIdField = GOSSIP_MENU_ID;
  readonly customStartingId = GOSSIP_MENU_CUSTOM_STARTING_ID;
  readonly selectService = inject(SelectGossipService);
  readonly handlerService = inject(GossipHandlerService);
}
