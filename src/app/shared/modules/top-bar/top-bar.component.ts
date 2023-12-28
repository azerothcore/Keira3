import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-top-bar',
  templateUrl: './top-bar.component.html',
})
export class TopBarComponent {
  @Input({ required: true }) selected: string;
  @Input({ required: true }) selectedName: string;
  @Input({ required: true }) isNew: boolean;
}
