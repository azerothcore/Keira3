import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ElectronService } from '@keira-shared/services/electron.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-highlightjs-wrapper',
  templateUrl: './highlightjs-wrapper.component.html',
})
export class HighlightjsWrapperComponent {
  @Input() code: string;

  constructor(readonly electronService: ElectronService) {}
}
