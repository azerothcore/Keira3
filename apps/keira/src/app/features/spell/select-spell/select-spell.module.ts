import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateModule, HighlightjsWrapperModule, IconModule, TopBarModule } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SelectSpellComponent } from './select-spell.component';
import { SelectSpellService } from './select-spell.service';

@NgModule({
  declarations: [SelectSpellComponent],
  imports: [
    CommonModule,
    TopBarModule,
    CreateModule,
    ReactiveFormsModule,
    HighlightjsWrapperModule,
    NgxDatatableModule,
    TranslateModule,
    IconModule,
  ],
  providers: [SelectSpellService],
})
export class SelectSpellModule {}
