import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ScriptWaypointHandlerService } from './script-waypoint-handler.service';

describe('ScriptWaypointHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([]), provideZonelessChangeDetection()] }));

  it('tracks whether the path is unsaved', () => {
    expect(TestBed.inject(ScriptWaypointHandlerService).isScriptWaypointTableUnsaved()).toBe(false);
  });
});
