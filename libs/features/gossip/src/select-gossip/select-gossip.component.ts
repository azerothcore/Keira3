import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  standalone: true,
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
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public readonly selectService: SelectGossipService,
    public readonly handlerService: GossipHandlerService,
  ) {
    super(GOSSIP_MENU_TABLE, GOSSIP_MENU_ID, GOSSIP_MENU_CUSTOM_STARTING_ID, selectService, handlerService);
  }
}
