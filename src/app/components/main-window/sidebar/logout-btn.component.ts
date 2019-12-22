import { Component } from '@angular/core';

import { ModalConfirmComponent } from '../../editors/shared/modal-confirm/modal-confirm.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { LocationService } from '../../../services/location.service';

@Component({
  selector: 'app-logout-btn',
  templateUrl: './logout-btn.component.html',
})
export class LogoutBtnComponent {

  public modalRef: BsModalRef;
  constructor(
      private modalService: BsModalService,
      private locationService: LocationService
  ) { }

  openModalConfirm() {
    this.modalRef = this.modalService.show(ModalConfirmComponent);
    this.modalRef.content.onClose.subscribe(result => {
        console.log('results', result);
        if (result) { this.logout(); }
    });
  }

  logout() {
    this.locationService.reload();
  }

}
