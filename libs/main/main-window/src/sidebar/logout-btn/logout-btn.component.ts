import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SubscriptionHandler } from '@keira/shared/utils';
import { LoginConfigService, WebAuthService } from '@keira/shared/login-config';
import { LocationService } from '@keira/shared/common-services';
import { ModalConfirmComponent } from '@keira/shared/base-editor-components';
import { KEIRA_APP_CONFIG_TOKEN, isWebLikeEnvironment } from '@keira/shared/config';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-logout-btn',
  templateUrl: './logout-btn.component.html',
  styleUrls: ['./logout-btn.component.scss'],
  imports: [TranslatePipe],
})
export class LogoutBtnComponent extends SubscriptionHandler {
  public modalRef!: BsModalRef;

  private readonly modalService = inject(BsModalService);
  private readonly locationService = inject(LocationService);
  private readonly translateService = inject(TranslateService);
  private readonly loginConfigService = inject(LoginConfigService);
  private readonly webAuthService = inject(WebAuthService);
  private readonly appConfig = inject(KEIRA_APP_CONFIG_TOKEN, { optional: true });

  // Web sessions are "logged out", desktop DB connections are "disconnected"
  readonly isWebEnvironment = isWebLikeEnvironment(this.appConfig);

  openModalConfirm(): void {
    const initialState = {
      title: this.translateService.instant(this.isWebEnvironment ? 'SIDEBAR.LOGOUT' : 'SIDEBAR.DISCONNECT'),
      content: this.translateService.instant(this.isWebEnvironment ? 'SIDEBAR.MODAL_LOGOUT' : 'SIDEBAR.MODAL_DISCONNECT'),
    };

    this.modalRef = this.modalService.show(ModalConfirmComponent, { initialState });

    this.subscriptions.push(
      this.modalRef.content.onClose.subscribe((result: boolean) => {
        if (result) {
          this.logout();
        }
      }),
    );
  }

  logout(): void {
    this.loginConfigService.saveRememberPreference(false);
    if (isWebLikeEnvironment(this.appConfig)) {
      this.subscriptions.push(
        this.webAuthService.logout().subscribe({
          next: () => this.locationService.reload(),
          error: () => this.locationService.reload(),
        }),
      );
    } else {
      this.locationService.reload();
    }
  }
}
