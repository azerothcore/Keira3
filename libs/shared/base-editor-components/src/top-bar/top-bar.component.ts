import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-top-bar',
  templateUrl: './top-bar.component.html',
  standalone: true,
})
export class TopBarComponent {
  @Input({ required: true }) selected: string | undefined;
  @Input({ required: true }) selectedName: string | undefined;
  @Input({ required: true }) isNew = false;
  @Input({ required: false }) customClass: string | undefined = undefined;

  get scssClass() {
    if (this.customClass) {
      return 'main-text text-truncate ' + this.customClass;
    }
    return 'main-text text-truncate';
  }
}
