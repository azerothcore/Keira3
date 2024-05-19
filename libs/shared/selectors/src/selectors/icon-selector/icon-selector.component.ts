import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-icon-selector',
  templateUrl: './icon-selector.component.html',
  standalone: true,
})
export class IconSelectorComponent {
  src = input.required<string>();
}
