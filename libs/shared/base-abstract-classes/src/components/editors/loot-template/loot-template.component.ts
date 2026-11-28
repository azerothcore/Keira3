import { LootTemplate } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '../multi-row-editor.component';
import { Directive } from '@angular/core';

/* v8 ignore next -- TODO: for some reason the next line gives coverage issues... */
@Directive()
export abstract class LootTemplateComponent<T extends LootTemplate> extends MultiRowEditorComponent<T> {}
