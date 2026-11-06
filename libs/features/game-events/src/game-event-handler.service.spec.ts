import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { GameEventHandlerService } from './game-event-handler.service';

describe('GameEventHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideZonelessChangeDetection(), GameEventHandlerService] }),
  );

  it('tells which part of the event is unsaved', () => {
    const service = TestBed.inject(GameEventHandlerService);
    for (const unsaved of [
      service.isGameEventUnsaved,
      service.isGameEventCreatureUnsaved,
      service.isGameEventGameobjectUnsaved,
      service.isGameEventPoolUnsaved,
      service.isGameEventPrerequisiteUnsaved,
      service.isGameEventNpcflagUnsaved,
      service.isGameEventModelEquipUnsaved,
      service.isGameEventNpcVendorUnsaved,
      service.isGameEventCreatureQuestUnsaved,
      service.isGameEventGameobjectQuestUnsaved,
      service.isGameEventSeasonalQuestUnsaved,
      service.isGameEventBattlegroundHolidayUnsaved,
    ]) {
      expect(unsaved()).toBe(false);
    }
  });
});
