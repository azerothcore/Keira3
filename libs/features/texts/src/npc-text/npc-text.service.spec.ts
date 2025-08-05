import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { NpcTextService } from './npc-text.service';
import { NpcTextHandlerService } from './npc-text-handler.service';
import { instance, mock } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

describe(NpcTextService.name, () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        NpcTextHandlerService,
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(NpcTextService)).toBeTruthy();
  });
});
