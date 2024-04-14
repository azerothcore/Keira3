import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SubscriptionHandler } from '@keira/shared/utils';
import { LoginConfigService } from '@keira/shared/login-config';
import { LocationService } from '@keira/shared/common-services';
import { ModalConfirmComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-logout-btn',
  templateUrl: './logout-btn.component.html',
  styleUrls: ['./logout-btn.component.scss'],
  standalone: true,
  imports: [TranslateModule],
})
export class LogoutBtnComponent extends SubscriptionHandler {
  public modalRef: BsModalRef;
  constructor(
    private readonly modalService: BsModalService,
    private readonly locationService: LocationService,
    private readonly translateService: TranslateService,
    private readonly loginConfigService: LoginConfigService,
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
    this.loginConfigService.saveRememberPreference(false);
    this.locationService.reload();
  }
}
