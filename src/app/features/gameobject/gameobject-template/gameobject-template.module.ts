import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { SingleValueSelectorModule } from '@keira-shared/modules/selectors/single-value-selector/single-value-selector.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { TranslateModule } from '@ngx-translate/core';
import { Model3DViewerModule } from 'app/features/model-3d-viewer/model-3d-viewer.module';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { GameobjectTemplateComponent } from './gameobject-template.component';
import { GameobjectTemplateService } from './gameobject-template.service';

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
