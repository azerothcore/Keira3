import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SidebarService } from './sidebar/sidebar.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
  selector: 'keira-main-window',
  templateUrl: './main-window.component.html',
  styleUrls: ['./main-window.component.scss'],
})
export class MainWindowComponent {
  constructor(public sidebarService: SidebarService) {}
}
