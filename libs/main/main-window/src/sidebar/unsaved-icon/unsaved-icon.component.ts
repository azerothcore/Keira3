import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-unsaved-icon',
  templateUrl: './unsaved-icon.component.html',
  styleUrls: ['./unsaved-icon.component.scss'],
  imports: [TooltipModule, TranslateModule],
})
export class UnsavedIconComponent {}
