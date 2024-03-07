import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent, MysqlQueryService } from '@keira/shared/core';
import { GossipMenu } from '@keira/shared/acore-world-model';
import { GossipHandlerService } from '../gossip-handler.service';
import { GossipMenuService } from './gossip-menu.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { EditorButtonsComponent } from '@keira/shared/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NpcTextSelectorBtnComponent } from '@keira/shared/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf, AsyncPipe } from '@angular/common';
import { TopBarComponent } from '@keira/shared/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gossip-menu',
  templateUrl: './gossip-menu.component.html',
  styleUrls: ['./gossip-menu.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    NgIf,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    NpcTextSelectorBtnComponent,
    TooltipModule,
    EditorButtonsComponent,
    NgxDatatableModule,
    AsyncPipe,
  ],
})
export class GossipMenuComponent extends MultiRowEditorComponent<GossipMenu> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: GossipMenuService,
    public handlerService: GossipHandlerService,
    readonly queryService: MysqlQueryService,
  ) {
    super(editorService, handlerService);
  }
}
