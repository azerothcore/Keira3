import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { TableRow, WIKI_BASE_URL } from '@keira/shared/constants';
import { compareObjFn, SubscriptionHandler } from '@keira/shared/utils';
import { EditorService } from '../../service/editors/editor.service';
import { HandlerService } from '../../service/handlers/handler.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export abstract class EditorComponent<T extends TableRow> extends SubscriptionHandler implements OnInit {
  protected abstract readonly editorService: EditorService<T>;
  protected abstract readonly handlerService: HandlerService<T>;

  readonly WIKI_BASE_URL = WIKI_BASE_URL;

  protected readonly changeDetectorRef = inject(ChangeDetectorRef);

  protected get docUrl(): string {
    return this.WIKI_BASE_URL + this.editorService.entityTable;
  }

  ngOnInit() {
    this.editorService.clearCache();

    if (this.editorService.loadedEntityId !== this.handlerService.selected || this.handlerService.forceReload) {
      this.handlerService.forceReload = false;
      this.editorService.reload(this.changeDetectorRef, this.handlerService.selected);
    }

    this.watchFormForChanges();
  }

  protected watchFormForChanges(): void {
    this.subscriptions.push(
      this.editorService.form.valueChanges.pipe(debounceTime(200), distinctUntilChanged(compareObjFn)).subscribe(
        /* istanbul ignore next */
        () => {
          setTimeout(() => {
            this.changeDetectorRef.markForCheck();
          });
        },
      ),
    );
  }

  save(query: string): void {
    this.editorService.save(this.changeDetectorRef, query);
  }
}
