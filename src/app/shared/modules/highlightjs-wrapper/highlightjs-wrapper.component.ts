import { Component, Input } from '@angular/core';
import { ElectronService } from '@keira-shared/services/electron.service';

@Component({
  selector: 'keira-highlightjs-wrapper',
  templateUrl: './highlightjs-wrapper.component.html',
})
export class HighlightjsWrapperComponent {
  @Input() code: string;

  constructor(readonly electronService: ElectronService) {}
}
