import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { KeiraTabsService, SECTION_START } from './keira-tabs.service';

/** The bar of Keira's tabs, over the page, with a launcher (+) opening any part of Keira in a tab. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss'],
  imports: [TranslatePipe],
})
export class TabBarComponent {
  protected readonly tabs = inject(KeiraTabsService);
  protected readonly launcherOpen = signal(false);
  /** The parts of Keira the launcher lists. */
  protected readonly sections = SECTION_START.map(([section]) => ({ section, url: '' }));

  protected launch(section: string): void {
    this.launcherOpen.set(false);
    this.tabs.launch(section);
  }
}
