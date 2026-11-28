import { Component, input } from '@angular/core';

@Component({
  selector: 'keira-icon-selector',
  templateUrl: './icon-selector.component.html',
})
export class IconSelectorComponent {
  readonly src = input.required<string>();
}
