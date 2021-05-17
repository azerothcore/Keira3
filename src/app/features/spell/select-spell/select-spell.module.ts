import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectSpellService } from './select-spell.service';
import { SelectSpellComponent } from './select-spell.component';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { CreateModule } from '@keira-shared/modules/create/create.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { highlightOptions } from '@keira-config/highlight.config';

@NgModule({
  declarations: [SelectSpellComponent],
  imports: [
    CommonModule,
    TopBarModule,
    CreateModule,
    ReactiveFormsModule,
    SearchButtonsModule,
    HighlightModule.forRoot(highlightOptions),
    NgxDatatableModule,
  ],
  providers: [SelectSpellService],
})
export class SelectSpellModule {}
