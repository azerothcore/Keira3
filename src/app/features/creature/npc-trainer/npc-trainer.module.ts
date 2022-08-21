import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { EditorButtonsModule } from '@keira-shared/modules/editor-buttons/editor-buttons.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { SkillSelectorModule } from '@keira-shared/modules/selectors/skill-selector/skill-selector.module';
import { SpellSelectorModule } from '@keira-shared/modules/selectors/spell-selector/spell-selector.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
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
