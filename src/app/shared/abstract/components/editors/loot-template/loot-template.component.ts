import { LootTemplate } from '@keira-types/loot-template.type';
import { MultiRowEditorComponent } from '../multi-row-editor.component';
import { Component } from '@angular/core';

/* istanbul ignore next */ // TODO: for some reason the next line gives coverage issues...
@Component({ template: '' })
export abstract class LootTemplateComponent<T extends LootTemplate> extends MultiRowEditorComponent<T> {}
