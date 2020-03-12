import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { ItemIconService } from '@keira-shared/services/item-icon.service';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  private readonly DEFAULT_ICON = 'inv_misc_questionmark';
  private _iconId: string = this.DEFAULT_ICON;

  @Input() size = 'medium';
  @Input() set itemId(itemId: string) {
    this.itemIconService.getIconById(itemId).subscribe(this.setIcon.bind(this));
  }
  @Input() set displayId(displayId: string) {
    this.itemIconService.getIconIdByDisplayId(displayId).subscribe(this.setIcon.bind(this));
  }

  get iconLink(): string {
    return `https://wow.zamimg.com/images/wow/icons/${this.size}/${this._iconId}.jpg`;
  }

  constructor(
    private readonly itemIconService: ItemIconService,
    private readonly cd: ChangeDetectorRef,
  ) {}

  private setIcon(icon: string) {
    this._iconId = !!icon ? icon : this.DEFAULT_ICON;
    this.cd.markForCheck();
  }
}
