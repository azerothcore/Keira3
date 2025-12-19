import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { PageTextHandlerService } from './page-text-handler.service';
import { Router } from '@angular/router';
import { PAGE_TEXT_TABLE, PAGE_TEXT_ID } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-page-text-copy',
  templateUrl: './page-text-copy.component.html',
  standalone: true,
  imports: [CopyOutputComponent],
})
export class PageTextCopyComponent implements OnInit {
  private readonly router = inject(Router);
  protected readonly handlerService = inject(PageTextHandlerService);

  protected readonly tableName = PAGE_TEXT_TABLE;
  protected readonly idField = PAGE_TEXT_ID;
  protected sourceId!: string | number;
  protected newId!: string | number;

  protected readonly relatedTables: Array<{ tableName: string; idField: string }> = [];

  ngOnInit(): void {
    if (!this.handlerService.sourceId || !this.handlerService.selected) {
      this.router.navigate(['/texts/select-page-text']);
      return;
    }

    this.sourceId = this.handlerService.sourceId;
    this.newId = this.handlerService.selected;
  }
}
