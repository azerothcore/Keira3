import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModalConfirmComponent } from '@keira-shared/modules/modal-confirm/modal-confirm.component';
import { LocationService } from '@keira-shared/services/location.service';
import { SubscriptionHandler } from '@keira-shared/utils/subscription-handler/subscription-handler';
import { TranslateService } from '@ngx-translate/core';
import { ConnectionWindowService } from 'app/main/connection-window/connection-window.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-logout-btn',
  templateUrl: './logout-btn.component.html',
  styleUrls: ['./logout-btn.component.scss'],
})
export class LogoutBtnComponent extends SubscriptionHandler {
  public modalRef: BsModalRef;
  constructor(
    private readonly modalService: BsModalService,
    private readonly locationService: LocationService,
    private readonly translateService: TranslateService,
    private readonly connectionWindowService: ConnectionWindowService,
  ) {
    super();
  }

  openModalConfirm(): void {
    const initialState = {
      title: this.translateService.instant('SIDEBAR.DISCONNECT'),
      content: this.translateService.instant('SIDEBAR.MODAL_DISCONNECT'),
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

  logout(): void {
    this.connectionWindowService.saveRememberPreference(false);
    this.locationService.reload();
  }
}
