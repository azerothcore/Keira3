import { Component } from '@angular/core';

import { LocationService } from '../../../services/location.service';
import { ModalConfirmComponent } from '../../editors/shared/modal-confirm/modal-confirm.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-logout-btn',
  templateUrl: './logout-btn.component.html',
})
export class LogoutBtnComponent extends ModalConfirmComponent {

  constructor(
    protected modalService: BsModalService,
    protected bsModalRef: BsModalRef,
    private locationService: LocationService,
  ) {
    super(
      modalService,
      bsModalRef,
      'Logout',
      'Are you sure you want to log out?'
    );
  }

  logout() {
    this.locationService.reload();
  }

  confirm() {
    this.logout();
    this.bsModalRef.hide();
  }

}
