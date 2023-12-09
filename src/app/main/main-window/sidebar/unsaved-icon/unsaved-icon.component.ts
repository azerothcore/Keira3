import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-unsaved-icon',
  templateUrl: './unsaved-icon.component.html',
  styleUrls: ['./unsaved-icon.component.scss'],
})
export class UnsavedIconComponent {}
