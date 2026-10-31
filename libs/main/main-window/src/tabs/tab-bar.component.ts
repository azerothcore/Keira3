import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { KeiraTabsService } from './keira-tabs.service';

/** The bar of Keira's tabs, over the page (once more than one part is open). */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss'],
  imports: [TranslatePipe],
})
export class TabBarComponent {
  protected readonly tabs = inject(KeiraTabsService);
}
