import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CreatureTemplate } from '@keira/shared/acore-world-model';
import { HandlerService } from './handler.service';
import { MockHandlerService } from '../../../core.mock';

describe('HandlerService', () => {
  let service: HandlerService<CreatureTemplate>;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [MockHandlerService],
    }),
  );

  beforeEach(() => {
    service = TestBed.inject(MockHandlerService);
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
    expect(navigateSpy).toHaveBeenCalledWith(['mock/route']);
  });
});
