import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { QueryOutputModule, SingleValueSelectorModule, TopBarModule } from '@keira/core';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { GameobjectTemplateComponent } from './gameobject-template.component';
import { GameobjectTemplateService } from './gameobject-template.service';
import { Model3DViewerModule } from '../../model-3d-viewer/model-3d-viewer.module';

@NgModule({
  declarations: [GameobjectTemplateComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule,
    ToastrModule,
    SingleValueSelectorModule,
    TranslateModule,
    Model3DViewerModule,
  ],
  exports: [GameobjectTemplateComponent],
  providers: [GameobjectTemplateService],
})
export class GameobjectTemplateModule {}
