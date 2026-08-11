import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TopBarComponent } from '@keira/shared/base-editor-components';
import { CONDITION_SOURCE_TYPES } from '@keira/shared/acore-world-model';
import { TranslateModule } from '@ngx-translate/core';
import { QuestHandlerService } from '../quest-handler.service';
import { NODE_HEIGHT, NODE_WIDTH } from './quest-chain.layout';
import { EMPTY_QUEST_CHAIN_GRAPH, QuestChainGraph, QuestChainNode } from './quest-chain.model';
import { QuestChainService } from './quest-chain.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-quest-chain',
  templateUrl: './quest-chain.component.html',
  styleUrls: ['./quest-chain.component.scss'],
  imports: [TopBarComponent, TranslateModule],
})
export class QuestChainComponent implements OnInit {
  private readonly questChainService = inject(QuestChainService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  readonly handlerService = inject(QuestHandlerService);

  protected readonly NODE_WIDTH = NODE_WIDTH;
  protected readonly NODE_HEIGHT = NODE_HEIGHT;

  protected readonly graph = signal<QuestChainGraph>({ ...EMPTY_QUEST_CHAIN_GRAPH });
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      this.graph.set(await this.questChainService.buildGraph());
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : String(error));
      this.graph.set({ ...EMPTY_QUEST_CHAIN_GRAPH });
    }

    this.loading.set(false);
    // Zoneless app: nothing else marks the view dirty after this await.
    this.changeDetectorRef.markForCheck();
  }

  protected label(node: QuestChainNode): string {
    return node.missing ? `[${node.id}]` : node.title;
  }

  /** Truncates long titles so they stay inside the node box. */
  protected shortLabel(node: QuestChainNode): string {
    const text = this.label(node);
    const limit = 24;

    return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
  }

  /** Jumps the editor to the clicked quest. Missing quests have nothing to open. */
  protected open(node: QuestChainNode): void {
    if (!node.missing && !node.isCurrent) {
      this.handlerService.select(false, node.id, node.title);
    }
  }

  /**
   * Opens the Conditions search prefilled with this quest's availability conditions.
   * The conditions editor is keyed by all ten condition columns, so the search screen is the only sane target.
   */
  protected openConditions(node: QuestChainNode, event: Event): void {
    // Otherwise the surrounding node box would also handle the click and navigate to the quest instead.
    event.stopPropagation();

    void this.router.navigate(['conditions/select'], {
      queryParams: { sourceType: CONDITION_SOURCE_TYPES.SOURCE_TYPE_QUEST_AVAILABLE, sourceEntry: node.id },
    });
  }
}
