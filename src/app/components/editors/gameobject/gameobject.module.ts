import { NgModule } from '@angular/core';

import { SelectGameobjectModule } from './select-gameobject/select-gameobject.module';
import { GameobjectTemplateModule } from './gameobject-template/gameobject-template.module';
import { GameobjectTemplateAddonModule } from './gameobject-template-addon/gameobject-template-addon.module';
import { GameobjectQuestitemModule } from './gameobject-questitem/gameobject-questitem.module';

const modules = [
  SelectGameobjectModule,
  GameobjectTemplateModule,
  GameobjectTemplateAddonModule,
  GameobjectQuestitemModule,
];

@NgModule({
  imports: [modules],
  exports: [modules],
})
export class GameobjectModule {}
