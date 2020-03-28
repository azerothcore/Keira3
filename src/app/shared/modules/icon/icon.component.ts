import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { IconService } from '@keira-shared/modules/icon/icon.service';
import { SubscriptionHandler } from '@keira-shared/utils/subscription-handler/subscription-handler';

@Component({
  selector: 'keira-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent extends SubscriptionHandler {
  private readonly DEFAULT_ICON = 'inv_misc_questionmark';
  private _iconId: string = this.DEFAULT_ICON;

  @Input() size: 'small'|'medium'|'large' = 'medium';
  @Input() set itemId(itemId: string | number) {
    if (!!itemId) {
      this.subscriptions.push(this.service.getIconByItemId(itemId).subscribe(this.setIcon.bind(this)));
    }
  }
  @Input() set itemDisplayId(displayId: string) {
    if (!!displayId) {
      this.subscriptions.push(this.service.getIconByItemDisplayId(displayId).subscribe(this.setIcon.bind(this)));
    }
  }

  get iconLink(): string {
    return `https://wow.zamimg.com/images/wow/icons/${this.size}/${this._iconId}.jpg`;
  }

  constructor(
    private readonly service: IconService,
    private readonly cd: ChangeDetectorRef,
  ) {
    super();
  }

  private setIcon(icon: string) {
    this._iconId = !!icon ? icon : this.DEFAULT_ICON;
    this.cd.markForCheck();
  }
}
