import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WowMapPreloadService } from '@keira/shared/wow-data';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SidebarService } from './sidebar/sidebar.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-main-window',
  templateUrl: './main-window.component.html',
  styleUrls: ['./main-window.component.scss'],
  imports: [SidebarComponent, RouterOutlet],
})
export class MainWindowComponent {
  readonly sidebarService = inject(SidebarService);

  constructor() {
    // every map's pictures, read in the background once Keira has started (when the world editor's cache asks for it)
    inject(WowMapPreloadService).startup();
  }
}
