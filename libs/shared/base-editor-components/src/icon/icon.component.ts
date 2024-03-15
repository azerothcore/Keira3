import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { ICON_SKILLS } from '@keira/shared/constants';
import { IconService } from './icon.service';
import { SubscriptionHandler } from '@keira/shared/core';

@Component({
  selector: 'keira-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class IconComponent extends SubscriptionHandler {
  private readonly DEFAULT_ICON = 'inv_misc_questionmark';
  private _iconId: string = this.DEFAULT_ICON;

  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() set itemId(itemId: string | number) {
    if (!!itemId) {
      this.subscriptions.push(this.service.getIconByItemId(itemId).subscribe(this.setIcon.bind(this)));
    }
  }
  @Input() set itemDisplayId(displayId: string | number) {
    if (!!displayId) {
      this.subscriptions.push(this.service.getIconByItemDisplayId(displayId).subscribe(this.setIcon.bind(this)));
    }
  }
  @Input() set skillId(skillId: string | number) {
    if (!!skillId && !!ICON_SKILLS[skillId]) {
      this.setIcon(ICON_SKILLS[skillId]);
    }
  }
  @Input() set spellId(spellId: string | number) {
    if (!!spellId) {
      this.subscriptions.push(this.service.getIconBySpellId(spellId).subscribe(this.setIcon.bind(this)));
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
