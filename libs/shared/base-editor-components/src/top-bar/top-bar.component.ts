import { ChangeDetectionStrategy, Component, Input, input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-top-bar',
  templateUrl: './top-bar.component.html',
  standalone: true,
})
export class TopBarComponent {
  @Input({ required: true }) selected: string | undefined;
  readonly selectedName = input.required<string | undefined>();
  readonly isNew = input.required<boolean>();
  readonly customScssClass = input<string>();

  get scssClass(): string {
    const customScssClass = this.customScssClass();
    if (customScssClass) {
      return 'main-text text-truncate ' + customScssClass;
    }
    return 'main-text text-truncate';
  }
}
