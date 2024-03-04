import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { EditorButtonsModule, NpcTextSelectorModule, QueryOutputModule, TopBarModule } from '@keira/core';
import { TranslateModule } from '@ngx-translate/core';
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
    TranslateModule,
  ],
  exports: [GossipMenuComponent],
  providers: [GossipMenuService],
})
export class GossipMenuModule {}
