import { ChangeDetectionStrategy, Component, Input, input } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { TableRow } from '@keira/shared/constants';
import { TranslatePipe } from '@ngx-translate/core';
import { FieldFilterComponent } from '../field-filter/field-filter.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-top-bar',
  templateUrl: './top-bar.component.html',
  imports: [FieldFilterComponent, TranslatePipe],
})
export class TopBarComponent {
  @Input({ required: true }) selected: string | undefined;
  readonly selectedName = input.required<string | undefined>();
  readonly isNew = input.required<boolean>();
  readonly customScssClass = input<string>();
  /** The editor's handler: its entity can be exported from here (#741). */
  readonly handler = input<HandlerService<TableRow>>();

  get scssClass(): string {
    const customScssClass = this.customScssClass();
    if (customScssClass) {
      return 'main-text text-truncate ' + customScssClass;
    }
    return 'main-text text-truncate';
  }
}
