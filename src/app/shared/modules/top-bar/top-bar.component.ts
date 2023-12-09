import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { HandlerService } from '../../abstract/service/handlers/handler.service';
import { TableRow } from '../../types/general';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-top-bar',
  templateUrl: './top-bar.component.html',
})
export class TopBarComponent<T extends TableRow> {
  @Input() handler: HandlerService<T>;
}
