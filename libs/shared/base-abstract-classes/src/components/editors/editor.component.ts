import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { TableRow, WIKI_BASE_URL } from '@keira/shared/constants';
import { HandlerService } from '../../service/handlers/handler.service';
import { EditorService } from '../../service/editors/editor.service';
import { SubscriptionHandler } from '@keira/shared/utils';
import { compareObjFn } from '@keira/shared/utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export abstract class EditorComponent<T extends TableRow> extends SubscriptionHandler implements OnInit {
  readonly WIKI_BASE_URL = WIKI_BASE_URL;

  protected readonly changeDetectorRef = inject(ChangeDetectorRef);

  public get docUrl(): string {
    return this.WIKI_BASE_URL + this.editorService.entityTable;
  }

  constructor(
    public editorService: EditorService<T>,
    protected handlerService: HandlerService<T>,
  ) {
    super();
  }

  ngOnInit() {
    this.editorService.clearCache();

    if (this.editorService.loadedEntityId !== this.handlerService.selected) {
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
