import { NgModule } from '@angular/core';

import { SelectGameobjectModule } from './select-gameobject/select-gameobject.module';
import { GameobjectTemplateModule } from './gameobject-template/gameobject-template.module';

const modules = [
  SelectGameobjectModule,
  GameobjectTemplateModule,
];

@NgModule({
  imports: [modules],
  exports: [modules],
})
export class GameobjectModule {}
