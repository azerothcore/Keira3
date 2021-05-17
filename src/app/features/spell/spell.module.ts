import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectSpellModule } from './select-spell/select-spell.module';
import { SpellHandlerService } from './spell-handler.service';
import { SpellDbcModule } from './spell-dbc/spell-dbc.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, SelectSpellModule, SpellDbcModule],
  providers: [SpellHandlerService],
})
export class SpellModule {}
