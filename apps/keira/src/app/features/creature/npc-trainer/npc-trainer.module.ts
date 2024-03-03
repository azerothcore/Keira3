import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { EditorButtonsModule, QueryOutputModule, SkillSelectorModule, SpellSelectorModule, TopBarModule } from '@keira/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { NpcTrainerComponent } from './npc-trainer.component';
import { NpcTrainerService } from './npc-trainer.service';

@NgModule({
  declarations: [NpcTrainerComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule,
    ToastrModule,
    NgxDatatableModule,
    SpellSelectorModule,
    SkillSelectorModule,
    EditorButtonsModule,
    TranslateModule,
  ],
  exports: [NpcTrainerComponent],
  providers: [NpcTrainerService],
})
export class NpcTrainerModule {}
