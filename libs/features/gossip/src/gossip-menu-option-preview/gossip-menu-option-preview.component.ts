import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { GossipMenuOption, OPTION_IMG } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gossip-menu-option-preview',
  templateUrl: './gossip-menu-option-preview.component.html',
  styleUrls: ['./gossip-menu-option-preview.component.scss'],
})
export class GossipMenuOptionPreviewComponent {
  readonly options = input.required<GossipMenuOption[]>();
  readonly show = input(true);

  protected readonly OPTION_IMG = OPTION_IMG;
}
