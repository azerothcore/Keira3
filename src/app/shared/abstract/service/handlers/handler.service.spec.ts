import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CreatureHandlerService } from '../../../../features/creature/creature-handler.service';
import { HandlerService } from './handler.service';
import { CreatureTemplate } from '@keira-types/creature-template.type';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { SaiCreatureHandlerService } from '../../../../features/creature/sai-creature-handler.service';

describe('HandlerService', () => {
  let service: HandlerService<CreatureTemplate>;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [CreatureHandlerService, SaiCreatureHandlerService],
    }),
  );

  beforeEach(() => {
    service = TestBed.inject(CreatureHandlerService);
  });

  it('initial state (no selection) should behave correctly', () => {
    expect(service.selected).toBeUndefined();
    expect(service.selectedName).toBeUndefined();
    expect(service.isNew).toBe(false);
    expect(service.canActivate()).toBe(false);
  });

  it('selection should behave correctly', () => {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    const id = 'myId';
    const name = 'myName';
    const isNew = true;

    service.select(isNew, id, name);

    expect(service.selected).toEqual(id);
    expect(service.selectedName).toEqual(name);
    expect(service.isNew).toEqual(isNew);
    expect(service.canActivate()).toBe(true);
    expect(navigateSpy).toHaveBeenCalledWith(['creature/creature-template']);
  });
});
