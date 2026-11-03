import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslatePipe } from '@ngx-translate/core';
import { ItemHandlerService } from '../item-handler.service';
import { ItemSources, ItemSourcesService } from './item-sources.service';

/** Where the selected item comes from (read only): its loot tables, the references, vendors and quests. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-sources',
  templateUrl: './item-sources.component.html',
  styleUrls: ['./item-sources.component.scss'],
  imports: [TopBarComponent, TranslatePipe],
})
export class ItemSourcesComponent implements OnInit {
  protected readonly handlerService = inject(ItemHandlerService);
  private readonly sourcesService = inject(ItemSourcesService);

  protected readonly sources = signal<ItemSources | undefined>(undefined);
  protected readonly error = signal('');

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.sources.set(undefined);
    this.error.set('');
    try {
      this.sources.set(await this.sourcesService.load(this.handlerService.selected));
    } catch (error) {
      this.error.set((error as { message?: string })?.message || String(error));
    }
  }

  protected count(min: number, max: number): string {
    return Number(min) === Number(max) ? String(min) : `${min}-${max}`;
  }
}
