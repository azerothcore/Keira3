import { Component } from '@angular/core';

import { AC_DISCORD_URL, AC_FORUM_URL, KEIRA3_REPO_URL, PAYPAL_DONATE_URL } from '../../../constants/general';

@Component({
  selector: 'app-coming-soon',
  templateUrl: './coming-soon.component.html',
  styleUrls: ['./coming-soon.component.scss']
})
export class ComingSoonComponent {
  public readonly PAYPAL_DONATE_URL = PAYPAL_DONATE_URL;
  public readonly AC_FORUM_URL = AC_FORUM_URL;
  public readonly AC_DISCORD_URL = AC_DISCORD_URL;
  public readonly KEIRA3_REPO_URL = KEIRA3_REPO_URL;
}
