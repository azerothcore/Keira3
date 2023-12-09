import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { OPTION_IMG } from '@keira-constants/options/gossip-option-icon';
import { GossipMenuOption } from '@keira-types/gossip-menu-option.type';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-gossip-menu-option-preview',
  templateUrl: './gossip-menu-option-preview.component.html',
  styleUrls: ['./gossip-menu-option-preview.component.scss'],
})
export class GossipMenuOptionPreviewComponent {
  @Input() options: GossipMenuOption[];
  @Input() show = true;

  readonly OPTION_IMG = OPTION_IMG;
}
