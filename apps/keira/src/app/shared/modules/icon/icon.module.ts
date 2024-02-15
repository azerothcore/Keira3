import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconComponent } from './icon.component';

@NgModule({
  declarations: [IconComponent],
  exports: [IconComponent],
  imports: [CommonModule],
})
export class IconModule {}
