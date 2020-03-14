import { Component } from '@angular/core';
import { SidebarService } from './sidebar/sidebar.service';

@Component({
  selector: 'keira-main-window',
  templateUrl: './main-window.component.html',
  styleUrls: ['./main-window.component.scss']
})
export class MainWindowComponent {
  constructor(
    public sidebarService: SidebarService,
  ) { }
}
