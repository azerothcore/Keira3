import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SidebarService } from './sidebar/sidebar.service';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NgClass } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-main-window',
  templateUrl: './main-window.component.html',
  styleUrls: ['./main-window.component.scss'],
  standalone: true,
  imports: [NgClass, SidebarComponent, RouterOutlet],
})
export class MainWindowComponent {
  constructor(public sidebarService: SidebarService) {}
}
