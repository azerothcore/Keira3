import { NgModule } from '@angular/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ModalConfirmComponent } from './modal-confirm.component';

@NgModule({
  declarations: [ ModalConfirmComponent ],
  imports: [ ModalModule.forRoot() ],
  exports: [ ModalConfirmComponent ],
})
export class ModalConfirmModule {}
