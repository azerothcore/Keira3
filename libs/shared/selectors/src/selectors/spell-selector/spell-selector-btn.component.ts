import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WowClientService, WowDataSettingsService } from '@keira/shared/wow-data';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { SpellInfoModalComponent } from './spell-info-modal.component';
import { SpellSelectorModalComponent } from './spell-selector-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-selector-btn',
  templateUrl: './spell-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  imports: [TranslatePipe],
})
export class SpellSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = SpellSelectorModalComponent;
  private readonly client = inject(WowClientService);
  private readonly wowSettings = inject(WowDataSettingsService);

  /** The spell's info is read from the game client: the desktop app with its folder set. */
  protected canShowInfo(): boolean {
    return this.client.isSupported() && this.wowSettings.isConfigured();
  }

  protected showInfo(): void {
    this.modalService.show(SpellInfoModalComponent, { class: 'modal-lg', initialState: { spellId: Number(this.control.value) } });
  }
}
