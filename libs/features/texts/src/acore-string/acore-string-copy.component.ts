import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { AcoreStringHandlerService } from './acore-string-handler.service';
import { Router } from '@angular/router';
import { ACORE_STRING_TABLE, ACORE_STRING_ENTRY } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-acore-string-copy',
  templateUrl: './acore-string-copy.component.html',
  standalone: true,
  imports: [CopyOutputComponent],
})
export class AcoreStringCopyComponent implements OnInit {
  private readonly router = inject(Router);
  protected readonly handlerService = inject(AcoreStringHandlerService);

  protected readonly tableName = ACORE_STRING_TABLE;
  protected readonly idField = ACORE_STRING_ENTRY;
  protected sourceId!: string | number;
  protected newId!: string | number;

  protected readonly relatedTables: Array<{ tableName: string; idField: string }> = [];

  ngOnInit(): void {
    if (!this.handlerService.sourceId || !this.handlerService.selected) {
      this.router.navigate(['/texts/select-acore-string']);
      return;
    }

    this.sourceId = this.handlerService.sourceId;
    this.newId = this.handlerService.selected;
  }
}
