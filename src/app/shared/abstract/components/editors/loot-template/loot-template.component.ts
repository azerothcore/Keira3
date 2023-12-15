import { LootTemplate } from '@keira-types/loot-template.type';
import { MultiRowEditorComponent } from '../multi-row-editor.component';
import { ChangeDetectionStrategy, Component } from '@angular/core';

/* istanbul ignore next */ // TODO: for some reason the next line gives coverage issues...
@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
  template: '',
})
export abstract class LootTemplateComponent<T extends LootTemplate> extends MultiRowEditorComponent<T> {}
