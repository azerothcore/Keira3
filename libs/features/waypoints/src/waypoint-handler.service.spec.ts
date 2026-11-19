import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SaiWaypointsHandlerService } from './sai-waypoints-handler.service';
import { WaypointHandlerService } from './waypoint-handler.service';
import { WaypointScriptsHandlerService } from './waypoint-scripts-handler.service';

describe('Waypoint handler services', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([]), provideZonelessChangeDetection()] }));

  it('track whether their tables are unsaved', () => {
    const paths = TestBed.inject(WaypointHandlerService);
    const scripts = TestBed.inject(WaypointScriptsHandlerService);
    expect(paths.isWaypointDataTableUnsaved()).toBe(false);
    expect(paths.isWaypointDataAddonTableUnsaved()).toBe(false);
    expect(TestBed.inject(SaiWaypointsHandlerService).isSaiWaypointsTableUnsaved()).toBe(false);
    expect(scripts.isWaypointScriptsTableUnsaved()).toBe(false);
  });
});
