import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectSpellService } from './select-spell.service';
import { SelectSpellComponent } from './select-spell.component';



@NgModule({
  declarations: [
    SelectSpellComponent
  ],
  imports: [
    CommonModule
  ],
  providers: [
    SelectSpellService,
  ],
})
export class SelectSpellModule { }
