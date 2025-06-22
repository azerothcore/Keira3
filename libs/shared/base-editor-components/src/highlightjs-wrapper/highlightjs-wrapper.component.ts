import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Highlight } from 'ngx-highlightjs';

import { ElectronService } from '@keira/shared/common-services';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-highlightjs-wrapper',
  templateUrl: './highlightjs-wrapper.component.html',
  imports: [Highlight],
})
export class HighlightjsWrapperComponent {
  readonly code = input.required<string>();
  readonly electronService = inject(ElectronService);
}
