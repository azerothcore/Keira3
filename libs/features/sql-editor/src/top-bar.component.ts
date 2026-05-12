import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  imports: [TranslateModule],
})
export class TopBarComponent {
  readonly newTab = output<void>();
  readonly save = output<void>();
  readonly saveAs = output<void>();
  readonly openFolder = output<void>();
  readonly execute = output<void>();
}
