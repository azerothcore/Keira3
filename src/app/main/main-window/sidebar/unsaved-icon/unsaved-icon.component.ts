import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-unsaved-icon',
  templateUrl: './unsaved-icon.component.html',
  styleUrls: ['./unsaved-icon.component.scss'],
})
export class UnsavedIconComponent {}
