import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';

import { BaseSelectorModalComponent } from '../base-selector/base-selector-modal.component';
import { FlagsService } from './flags.service';
import { FlagsModalConfig } from './flags-selector.model';
import { TranslateModule } from '@ngx-translate/core';
import { UiSwitchModule } from 'ngx-ui-switch';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-flags-selector-modal',
  templateUrl: './flags-selector-modal.component.html',
  styleUrls: ['./flags-selector-modal.component.scss'],
  standalone: true,
  imports: [UiSwitchModule, TranslateModule],
})
export class FlagsSelectorModalComponent extends BaseSelectorModalComponent<FlagsModalConfig> implements OnInit {
  readonly pow = Math.pow;

  private readonly flagsService = inject(FlagsService);
  flagValues: boolean[] = [];

  ngOnInit() {
    if (this.config) {
      this.flagValues = this.flagsService.getBitsArray(this.config.flags, parseInt(`${this.value}`, 10));
    }
  }

  toggleBit(bit: number) {
    this.flagValues[bit] = !this.flagValues[bit];
    this.value = this.flagsService.getValueFromBits(this.flagValues);
  }
}
