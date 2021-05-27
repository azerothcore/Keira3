import { Component } from '@angular/core';

import { ModalConfirmComponent } from '@keira-shared/modules/modal-confirm/modal-confirm.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { LocationService } from '@keira-shared/services/location.service';
import { SubscriptionHandler } from '@keira-shared/utils/subscription-handler/subscription-handler';

@Component({
  selector: 'keira-disconnect-btn',
  templateUrl: './disconnect-btn.component.html',
  styleUrls: ['./disconnect-btn.component.scss'],
})
export class DisconnectBtnComponent extends SubscriptionHandler {
  public modalRef: BsModalRef;
  constructor(private modalService: BsModalService, private locationService: LocationService) {
    super();
  }

  openModalConfirm() {
    const initialState = {
      title: 'Disconnect',
      content: 'Are you sure you want to disconnect?',
    };

    this.modalRef = this.modalService.show(ModalConfirmComponent, { initialState });

    this.subscriptions.push(
      this.modalRef.content.onClose.subscribe((result) => {
        if (result) {
          this.disconnect();
        }
      }),
    );
  }

  disconnect() {
    // On disconnect we will assume we don't wish to reconnect.
    localStorage.setItem('auto_login', 'false');
    this.locationService.reload();
  }
}
