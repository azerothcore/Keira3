import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpellDbcComponent } from './spell-dbc.component';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';



@NgModule({
  declarations: [
    SpellDbcComponent
  ],
  imports: [
    CommonModule,
    TopBarModule,
    QueryOutputModule,
    ReactiveFormsModule,
    TooltipModule
  ]
})
export class SpellDbcModule { }
