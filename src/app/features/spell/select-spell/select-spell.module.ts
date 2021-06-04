import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectSpellService } from './select-spell.service';
import { SelectSpellComponent } from './select-spell.component';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { CreateModule } from '@keira-shared/modules/create/create.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';
import { HighlightjsWrapperModule } from '@keira-shared/modules/highlightjs-wrapper/highlightjs-wrapper.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  declarations: [SelectSpellComponent],
  imports: [
    CommonModule,
    TopBarModule,
    CreateModule,
    ReactiveFormsModule,
    SearchButtonsModule,
    HighlightjsWrapperModule,
    NgxDatatableModule,
  ],
  providers: [SelectSpellService],
})
export class SelectSpellModule {}
