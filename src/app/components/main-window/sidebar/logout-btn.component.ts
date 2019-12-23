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
    const initialState = {
      title: 'Logout',
      content: 'Are you sure yopu want to logout?'
    };
    this.modalRef = this.modalService.show(ModalConfirmComponent, { initialState });
    this.modalRef.content.onClose.subscribe(result => {
      if (result) {
        this.logout();
      }
    });
  }

  logout() {
    this.locationService.reload();
  }

}
