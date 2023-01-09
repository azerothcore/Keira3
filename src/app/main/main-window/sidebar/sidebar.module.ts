import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ModalConfirmModule } from '@keira-shared/modules/modal-confirm/modal-confirm.module';
import { SwitchLanguageModule } from '@keira-shared/modules/switch-language/switch-language.module';
import { TranslateModule } from '@ngx-translate/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { LogoutBtnComponent } from './logout-btn/logout-btn.component';
import { SidebarComponent } from './sidebar.component';
import { UnsavedIconComponent } from './unsaved-icon/unsaved-icon.component';

@NgModule({
  declarations: [SidebarComponent, LogoutBtnComponent, UnsavedIconComponent],
  imports: [RouterModule, BrowserAnimationsModule, ModalModule, ModalConfirmModule, TooltipModule, TranslateModule, SwitchLanguageModule],
  exports: [SidebarComponent],
})
export class SidebarModule {}
