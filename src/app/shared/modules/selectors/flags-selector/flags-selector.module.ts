import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ModalModule } from 'ngx-bootstrap/modal';
import { UiSwitchModule } from 'ngx-ui-switch';
import { FlagsSelectorBtnComponent } from './flags-selector-btn.component';
import { FlagsSelectorModalComponent } from './flags-selector-modal.component';

@NgModule({
  declarations: [FlagsSelectorModalComponent, FlagsSelectorBtnComponent],
  imports: [BrowserModule, ModalModule, UiSwitchModule],
  exports: [FlagsSelectorBtnComponent],
})
export class FlagsSelectorModule {}
