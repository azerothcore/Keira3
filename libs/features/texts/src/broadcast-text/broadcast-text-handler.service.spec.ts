import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BroadcastTextHandlerService } from './broadcast-text-handler.service';
import { BROADCAST_TEXT_TABLE } from '@keira/shared/acore-world-model';

describe(BroadcastTextHandlerService.name, () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), BroadcastTextHandlerService],
    }),
  );

  const setup = () => {
    const service = TestBed.inject(BroadcastTextHandlerService);
    return { service };
  };

  it('isUnsaved should return the value of the statusMap for the broadcast_text table', () => {
    const { service } = setup();
    expect(service.isUnsaved()).toBe(false); // defaults to false

    service.statusMap[BROADCAST_TEXT_TABLE].set(true);
    expect(service.isUnsaved()).toBe(true);

    service.statusMap[BROADCAST_TEXT_TABLE].set(false);
    expect(service.isUnsaved()).toBe(false);
  });
});
