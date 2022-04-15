import { Component } from '@angular/core';
import { ModalConfirmComponent } from '@keira-shared/modules/modal-confirm/modal-confirm.component';
import { LocationService } from '@keira-shared/services/location.service';
import { SubscriptionHandler } from '@keira-shared/utils/subscription-handler/subscription-handler';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'keira-logout-btn',
  templateUrl: './logout-btn.component.html',
  styleUrls: ['./logout-btn.component.scss'],
})
export class LogoutBtnComponent extends SubscriptionHandler {
  public modalRef: BsModalRef;
  constructor(private modalService: BsModalService, private locationService: LocationService) {
    super();
  }

  openModalConfirm() {
    const initialState = {
      title: 'Logout',
      content: 'Are you sure you want to logout?',
    };

    this.modalRef = this.modalService.show(ModalConfirmComponent, { initialState });

    this.subscriptions.push(
      this.modalRef.content.onClose.subscribe((result) => {
        if (result) {
          this.logout();
        }
      }),
    );
  }

  logout() {
    this.locationService.reload();
  }
}
