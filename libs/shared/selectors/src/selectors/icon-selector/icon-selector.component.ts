import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-icon-selector',
  templateUrl: './icon-selector.component.html',
})
export class IconSelectorComponent {
  readonly src = input.required<string>();
}
