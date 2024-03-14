import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ElectronService } from '../../services/electron.service';
import { Highlight } from 'ngx-highlightjs';
import { NgIf } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-highlightjs-wrapper',
  templateUrl: './highlightjs-wrapper.component.html',
  standalone: true,
  imports: [NgIf, Highlight],
})
export class HighlightjsWrapperComponent {
  @Input() code: string;

  constructor(readonly electronService: ElectronService) {}
}
