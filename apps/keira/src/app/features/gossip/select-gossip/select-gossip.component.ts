import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MysqlQueryService, SelectComponent } from '@keira/shared/core';
import { GOSSIP_MENU_CUSTOM_STARTING_ID, GOSSIP_MENU_ID, GOSSIP_MENU_TABLE, GossipMenu } from '@keira/shared/acore-world-model';
import { GossipHandlerService } from '../gossip-handler.service';
import { SelectGossipService } from './select-gossip.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgIf, AsyncPipe } from '@angular/common';
import { HighlightjsWrapperComponent } from '@keira/shared/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CreateComponent } from '@keira/shared/core';
import { TopBarComponent } from '@keira/shared/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-select-gossip',
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
    NgIf,
    NgxDatatableModule,
    AsyncPipe,
  ],
})
export class SelectGossipComponent extends SelectComponent<GossipMenu> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: SelectGossipService,
    public handlerService: GossipHandlerService,
    public queryService: MysqlQueryService,
  ) {
    super(GOSSIP_MENU_TABLE, GOSSIP_MENU_ID, GOSSIP_MENU_CUSTOM_STARTING_ID, selectService, handlerService, queryService);
  }
}
