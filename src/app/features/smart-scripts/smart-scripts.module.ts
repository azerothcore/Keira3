import { NgModule } from '@angular/core';

import { SaiSearchEntityModule } from './sai-search-entity/sai-search-entity.module';
import { SaiSearchExistingModule } from './sai-search-existing/sai-search-existing.module';
import { SaiFullEditorModule } from './sai-full-editor/sai-full-editor.module';

const modules = [
  SaiSearchEntityModule,
  SaiSearchExistingModule,
  SaiFullEditorModule,
];

@NgModule({
  imports: [modules],
  exports: [modules],
})
export class SmartScriptsModule { }
