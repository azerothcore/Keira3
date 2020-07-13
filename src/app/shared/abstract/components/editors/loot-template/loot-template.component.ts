import { LootTemplate } from '@keira-types/loot-template.type';
import { MultiRowEditorComponent } from '../multi-row-editor.component';

/* istanbul ignore next */ // TODO: for some reason the next line gives coverage issues...
export abstract class LootTemplateComponent<T extends LootTemplate> extends MultiRowEditorComponent<T> { }
