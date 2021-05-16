import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { GossipMenuComponent } from './gossip-menu.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { GossipMenuService } from './gossip-menu.service';
import { EditorButtonsModule } from '@keira-shared/modules/editor-buttons/editor-buttons.module';
import { NpcTextSelectorModule } from '@keira-shared/modules/selectors/npc-text-selector/npc-text-selector.module';

@NgModule({
  declarations: [GossipMenuComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule.forRoot(),
    ToastrModule.forRoot(toastrConfig),
    NgxDatatableModule,
    EditorButtonsModule,
    NpcTextSelectorModule,
  ],
  exports: [GossipMenuComponent],
  providers: [GossipMenuService],
})
export class GossipMenuModule {}
