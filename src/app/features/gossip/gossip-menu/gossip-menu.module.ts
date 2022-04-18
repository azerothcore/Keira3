import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { EditorButtonsModule } from '@keira-shared/modules/editor-buttons/editor-buttons.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { NpcTextSelectorModule } from '@keira-shared/modules/selectors/npc-text-selector/npc-text-selector.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { GossipMenuComponent } from './gossip-menu.component';
import { GossipMenuService } from './gossip-menu.service';

@NgModule({
  declarations: [GossipMenuComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule,
    ToastrModule,
    NgxDatatableModule,
    EditorButtonsModule,
    NpcTextSelectorModule,
  ],
  exports: [GossipMenuComponent],
  providers: [GossipMenuService],
})
export class GossipMenuModule {}
