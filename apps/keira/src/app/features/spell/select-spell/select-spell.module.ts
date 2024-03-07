import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SelectSpellComponent } from './select-spell.component';
import { SelectSpellService } from './select-spell.service';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, NgxDatatableModule, TranslateModule, SelectSpellComponent],
  providers: [SelectSpellService],
})
export class SelectSpellModule {}
