import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SelectSpellModule } from './select-spell/select-spell.module';
import { SpellDbcModule } from './spell-dbc/spell-dbc.module';
import { SpellHandlerService } from './spell-handler.service';

@NgModule({
  declarations: [],
  imports: [CommonModule, SelectSpellModule, SpellDbcModule],
  providers: [SpellHandlerService],
})
export class SpellModule {}
