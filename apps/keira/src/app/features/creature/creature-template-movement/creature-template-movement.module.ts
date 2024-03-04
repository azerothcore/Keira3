import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { QueryOutputModule, SingleValueSelectorModule, TopBarModule } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { CreatureTemplateMovementComponent } from './creature-template-movement.component';
import { CreatureTemplateMovementService } from './creature-template-movement.service';

@NgModule({
  declarations: [CreatureTemplateMovementComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule,
    ToastrModule,
    SingleValueSelectorModule,
    TranslateModule,
  ],
  exports: [CreatureTemplateMovementComponent],
  providers: [CreatureTemplateMovementService],
})
export class CreatureTemplateMovementModule {}
