import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CreatureHandlerService } from './creature-handler.service';
import { HandlerService } from './handler.service';
import { CreatureTemplate } from '../../types/creature-template.type';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

describe('HandlerService', () => {

  let service: HandlerService<CreatureTemplate>;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ]
  }));

  beforeEach(() => {
    service = TestBed.get(CreatureHandlerService);
  });

  it('initial state (no selection) should behave correctly', () => {
    expect(service.selected).toBeUndefined();
    expect(service.selectedName).toBeUndefined();
    expect(service.isNew).toBe(false);
    expect(service.canActivate({} as ActivatedRouteSnapshot)).toBe(false);
  });

  it('selection should behave correctly', () => {
    const navigateSpy = spyOn(TestBed.get(Router), 'navigate');
    const id = 'myId';
    const name = 'myName';
    const isNew = true;

    service.select(isNew, id, name);

    expect(service.selected).toEqual(id);
    expect(service.selectedName).toEqual(name);
    expect(service.isNew).toEqual(isNew);
    expect(service.canActivate({} as ActivatedRouteSnapshot)).toBe(true);
    expect(navigateSpy).toHaveBeenCalledWith(['creature/creature-template']);
  });
});
