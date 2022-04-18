import { NgModule } from '@angular/core';
import { SaiFullEditorModule } from './sai-full-editor/sai-full-editor.module';
import { SaiSearchEntityModule } from './sai-search-entity/sai-search-entity.module';
import { SaiSearchExistingModule } from './sai-search-existing/sai-search-existing.module';

const modules = [SaiSearchEntityModule, SaiSearchExistingModule, SaiFullEditorModule];

@NgModule({
  imports: [modules],
  exports: [modules],
})
export class SmartScriptsModule {}
