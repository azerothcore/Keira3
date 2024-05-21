import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-icon-selector',
  templateUrl: './icon-selector.component.html',
  standalone: true,
})
export class IconSelectorComponent {
  @Input({ required: true }) src: string;
}
