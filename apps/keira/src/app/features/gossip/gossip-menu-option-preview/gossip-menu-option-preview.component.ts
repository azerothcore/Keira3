import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { OPTION_IMG } from '@keira/acore-world-model';
import { GossipMenuOption } from '@keira/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gossip-menu-option-preview',
  templateUrl: './gossip-menu-option-preview.component.html',
  styleUrls: ['./gossip-menu-option-preview.component.scss'],
})
export class GossipMenuOptionPreviewComponent {
  @Input() options: GossipMenuOption[];
  @Input() show = true;

  readonly OPTION_IMG = OPTION_IMG;
}
