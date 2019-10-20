import { NgModule } from '@angular/core';

import { SaiSearchEntityModule } from './sai-search-entity/sai-search-entity.module';
import { SaiSearchExistingModule } from './sai-search-existing/sai-search-existing.module';
import { SaiEditorModule } from './sai-editor/sai-editor.module';

const modules = [
  SaiSearchEntityModule,
  SaiSearchExistingModule,
  SaiEditorModule,
];

@NgModule({
  imports: [modules],
  exports: [modules],
})
export class SmartScriptsModule {}
