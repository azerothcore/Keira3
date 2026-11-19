import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { WowClientService, WowDataSettingsService } from '@keira/shared/wow-data';
import { TranslatePipe } from '@ngx-translate/core';
import { LocalModelViewerComponent } from './local-model-viewer.component';

/**
 * Finds a creature or gameobject display by its model's name in the game data (#3016): search, look at the model,
 * then use its id in the field. Shown in the desktop app with a client folder set.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-display-search',
  templateUrl: './display-search.component.html',
  imports: [TranslatePipe, LocalModelViewerComponent],
})
export class DisplaySearchComponent {
  private readonly client = inject(WowClientService);
  private readonly paths = inject(WowDataSettingsService);

  readonly kind = input.required<'creature' | 'gameobject'>();
  readonly control = input.required<AbstractControl>();

  protected readonly open = signal(false);
  protected readonly results = signal<{ id: number; model: string }[] | undefined>(undefined);
  protected readonly picked = signal<number | undefined>(undefined);
  protected readonly error = signal('');

  protected available(): boolean {
    return this.client.isSupported() && this.paths.isConfigured();
  }

  protected async search(text: string): Promise<void> {
    this.error.set('');
    try {
      this.results.set(await this.client.findDisplays(this.kind(), text));
    } catch (error) {
      this.results.set([]);
      this.error.set((error as Error)?.message ?? String(error));
    }
  }

  protected use(): void {
    const control = this.control();
    control.setValue(this.picked());
    control.markAsDirty();
    this.open.set(false);
  }
}
