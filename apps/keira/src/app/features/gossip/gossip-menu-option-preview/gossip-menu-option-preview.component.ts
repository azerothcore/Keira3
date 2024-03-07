import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GossipMenuOption, OPTION_IMG } from '@keira/shared/acore-world-model';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gossip-menu-option-preview',
  templateUrl: './gossip-menu-option-preview.component.html',
  styleUrls: ['./gossip-menu-option-preview.component.scss'],
  standalone: true,
  imports: [NgClass, NgFor, NgIf],
})
export class GossipMenuOptionPreviewComponent {
  @Input() options: GossipMenuOption[];
  @Input() show = true;

  readonly OPTION_IMG = OPTION_IMG;
}
