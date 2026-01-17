import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CreatureTemplate } from '@keira/shared/acore-world-model';
import { MockHandlerService } from '../../core.mock';
import { HandlerService } from './handler.service';

describe('HandlerService', () => {
  let service: HandlerService<CreatureTemplate>;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), MockHandlerService],
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
    expect(service.itemQualityScssClass).toBe('');
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

  it('should not throw error when _statusMap is undefined in resetStatus()', () => {
    (service as any)._statusMap = undefined;

    expect(() => (service as any).resetStatus()).not.toThrow();
  });

  it('should correctly stringify object id', () => {
    const id = { entryorguid: 123, source_type: 456 };
    const name = 'myName';
    service.select(true, id, name);

    expect(service.selected).toEqual(JSON.stringify(id));
  });

  it('selects the same entity and force the reload', () => {
    const id = 'myId';
    const name = 'myName';
    const isNew = true;

    service['_selected'] = id;
    expect(service.forceReload).toBeFalse();

    service.select(isNew, id, name);

    expect(service.forceReload).toBeTrue();
  });

  it('should correctly save custom scss class', () => {
    const quality = 5;
    service.itemQualityScssClass = quality;
    expect(service.itemQualityScssClass).toEqual(`item-quality-q${quality}`);
  });

  it('should correctly set the default itemQualityScssClass when quality is 0', () => {
    service.itemQualityScssClass = 0;
    expect(service.itemQualityScssClass).toEqual('item-quality-q0');
  });

  it('should not navigate when navigate is false', () => {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    const id = 'myId';
    const name = 'myName';

    service.select(true, id, name, false);

    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
