import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { MockHandlerService } from '../../core.mock';

describe('HandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideZonelessChangeDetection(), provideNoopAnimations(), MockHandlerService],
    }),
  );

  function setup() {
    const service = TestBed.inject(MockHandlerService);
    return { service };
  }

  it('initial state (no selection) should behave correctly', () => {
    const { service } = setup();
    expect(service.selected).toBeUndefined();
    expect(service.selectedName).toBeUndefined();
    expect(service.isNew).toBe(false);
    expect(service.canActivate()).toBe(false);
    expect(service.itemQualityScssClass).toBe('');
  });

  it('selection should behave correctly', () => {
    const { service } = setup();
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockImplementation(() => undefined);
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

  it('should navigate to copy route when creating from a copy', () => {
    const { service } = setup();
    (service as unknown as { copyRoutePath: string }).copyRoutePath = 'mock/copy';
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockImplementation(() => Promise.resolve(true));

    service.select(true, 'copyId', 'copyName', true, 'source-123');

    expect(service.sourceId).toBe('source-123');
    expect(navigateSpy).toHaveBeenCalledWith(['mock/copy']);
  });

  it('exports the selected entity on its copy page, until another is selected', () => {
    const { service } = setup();
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockImplementation(() => Promise.resolve(true));

    service.exportEntity();
    expect(service.canExport).toBe(false);
    service.select(false, '12', 'name', false);
    expect(service.canExport).toBe(false);
    service.exportEntity();
    expect(navigateSpy).not.toHaveBeenCalled();

    (service as unknown as { copyRoutePath: string }).copyRoutePath = 'mock/copy';
    expect(service.canExport).toBe(true);
    service.exportEntity();
    expect(service.sourceId).toBe('12');
    expect(service.exporting).toBe(true);
    expect(navigateSpy).toHaveBeenCalledWith(['mock/copy']);

    service.select(true, '13', 'new', false);
    expect(service.exporting).toBe(false);
    expect(service.canExport).toBe(false);
  });

  it('should not throw error when _statusMap is undefined in resetStatus()', () => {
    const { service } = setup();
    (service as any)._statusMap = undefined;

    expect(() => (service as any).resetStatus()).not.toThrow();
  });

  it('should correctly stringify object id', () => {
    const { service } = setup();
    const id = { entryorguid: 123, source_type: 456 };
    const name = 'myName';
    service.select(true, id, name);

    expect(service.selected).toEqual(JSON.stringify(id));
  });

  it('selects the same entity and force the reload', () => {
    const { service } = setup();
    const id = 'myId';
    const name = 'myName';
    const isNew = true;

    service['_selected'] = id;
    expect(service.forceReload).toBe(false);

    service.select(isNew, id, name);

    expect(service.forceReload).toBe(true);
  });

  it('should correctly save custom scss class', () => {
    const { service } = setup();
    const quality = 5;
    service.itemQualityScssClass = quality;
    expect(service.itemQualityScssClass).toEqual(`item-quality-q${quality}`);
  });

  it('should correctly set the default itemQualityScssClass when quality is 0', () => {
    const { service } = setup();
    service.itemQualityScssClass = 0;
    expect(service.itemQualityScssClass).toEqual('item-quality-q0');
  });

  it('should not navigate when navigate is false', () => {
    const { service } = setup();
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockImplementation(() => undefined);
    const id = 'myId';
    const name = 'myName';

    service.select(true, id, name, false);

    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
