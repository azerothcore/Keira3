import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ModalModule } from 'ngx-bootstrap';
import { UiSwitchModule } from 'ngx-ui-switch';

import { FlagsSelectorModalComponent } from './flags-selector-modal.component';
import { FlagsSelectorBtnComponent } from './flags-selector-btn.component';
import { uiSwitchConfig } from '../../../../../config/ui-switch.config';

@NgModule({
  entryComponents: [
    FlagsSelectorModalComponent,
  ],
  declarations: [
    FlagsSelectorModalComponent,
    FlagsSelectorBtnComponent,
  ],
  imports: [
    BrowserModule,
    ModalModule.forRoot(),
    UiSwitchModule.forRoot(uiSwitchConfig),
  ],
  exports: [
    FlagsSelectorBtnComponent,
  ],
})
export class FlagsSelectorModule {}
