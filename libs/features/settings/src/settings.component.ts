import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GameDataFoldersComponent } from '@keira/shared/world-viewer';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

/** Keira's settings: how it behaves on this computer, starting with the game data folders (the World Editor's). */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [GameDataFoldersComponent, TranslatePipe],
})
export class SettingsComponent {
  private readonly toastr = inject(ToastrService);
  private readonly translate = inject(TranslateService);

  protected onSaved(): void {
    this.toastr.success(this.translate.instant('SETTINGS.SAVED'));
  }
}
