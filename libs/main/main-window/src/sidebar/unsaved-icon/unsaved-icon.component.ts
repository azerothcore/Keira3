import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-unsaved-icon',
  templateUrl: './unsaved-icon.component.html',
  styleUrls: ['./unsaved-icon.component.scss'],
  imports: [TooltipDirective, TranslatePipe],
})
export class UnsavedIconComponent {}
