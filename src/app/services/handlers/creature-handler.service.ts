import { Injectable } from '@angular/core';
import { HandlerService } from './handler.service';
import { CreatureTemplate } from '../../types/creature-template.type';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CreatureHandlerService extends HandlerService<CreatureTemplate> {
  constructor(
    protected router: Router,
  ) {
    super(
      'creature/creature-template',
      router,
    );
  }
}
