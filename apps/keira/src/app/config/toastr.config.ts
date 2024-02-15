import { GlobalConfig } from 'ngx-toastr';

export const toastrConfig: Partial<GlobalConfig> = {
  closeButton: true,
  timeOut: 3_000,
  maxOpened: 3,
  autoDismiss: true,
};
