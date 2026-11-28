import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import {
  LOOT_TEMPLATE_ID,
  REFERENCE_LOOT_TEMPLATE_CUSTOM_STARTING_ID,
  REFERENCE_LOOT_TEMPLATE_TABLE,
  ReferenceLootTemplate,
} from '@keira/shared/acore-world-model';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';
import { SelectReferenceLootService } from './select-reference-loot.service';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  templateUrl: '../select-loot.component.html',
  imports: [
    TopBarComponent,
    CreateComponent,
    TranslateDirective,
    TranslatePipe,
    FormsModule,
    ReactiveFormsModule,
    HighlightjsWrapperComponent,
    NgxDatatableModule,
  ],
})
export class SelectReferenceLootComponent extends SelectComponent<ReferenceLootTemplate> implements OnInit {
  readonly entityTable = REFERENCE_LOOT_TEMPLATE_TABLE;
  readonly entityIdField = LOOT_TEMPLATE_ID;
  readonly customStartingId = REFERENCE_LOOT_TEMPLATE_CUSTOM_STARTING_ID;
  readonly selectService = inject(SelectReferenceLootService);
  readonly handlerService = inject(ReferenceLootHandlerService);
  private readonly activatedRoute = inject(ActivatedRoute);

  /** Lets other screens open a reference directly, e.g. the read-only reference viewer of a creature loot. */
  ngOnInit(): void {
    const { id } = this.activatedRoute.snapshot.queryParams;

    if (id !== undefined) {
      this.handlerService.select(false, Number(id), this.entityTable);
    }
  }
}
