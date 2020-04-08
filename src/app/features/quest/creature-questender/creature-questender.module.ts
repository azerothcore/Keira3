import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { CreatureQuestenderComponent } from './creature-questender.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';
import { CreatureSelectorModule } from '@keira-shared/modules/selectors/creature-selector/creature-selector.module';
import { CreatureQuestenderService } from './creature-questender.service';
import { EditorButtonsModule } from '@keira-shared/modules/editor-buttons/editor-buttons.module';
import { QuestPreviewModule } from '../quest-preview/quest-preview.module';

@NgModule({
  declarations: [
    CreatureQuestenderComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    NgxDatatableModule,
    TooltipModule.forRoot(),
    ToastrModule.forRoot(toastrConfig),
    CreatureSelectorModule,
    EditorButtonsModule,
    QuestPreviewModule,
  ],
  exports: [
    CreatureQuestenderComponent,
  ],
  providers: [
    CreatureQuestenderService,
  ],
})
export class CreatureQuestenderModule {}
