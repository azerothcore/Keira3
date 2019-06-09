import { Component, OnInit } from '@angular/core';
import { SidebarService } from './sidebar/sidebar.service';

@Component({
  selector: 'app-main-window',
  templateUrl: './main-window.component.html',
  styleUrls: ['./main-window.component.scss']
})
export class MainWindowComponent implements OnInit {

  title = 'Keira3';

  constructor(
    public sidebarService: SidebarService,
  ) { }

  ngOnInit() {
  }

  toggleSidebar() {
    this.sidebarService.setSidebarState(!this.sidebarService.getSidebarState());
  }

  toggleBackgroundImage() {
    this.sidebarService.hasBackgroundImage = !this.sidebarService.hasBackgroundImage;
  }

  getSideBarState() {
    return this.sidebarService.getSidebarState();
  }

  hideSidebar() {
    this.sidebarService.setSidebarState(true);
  }
}
