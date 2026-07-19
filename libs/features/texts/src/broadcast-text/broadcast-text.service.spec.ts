import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BroadcastTextService } from './broadcast-text.service';
import { BroadcastTextHandlerService } from './broadcast-text-handler.service';
import { instance, mock } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

describe(BroadcastTextService.name, () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        BroadcastTextHandlerService,
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(BroadcastTextService)).toBeTruthy();
  });
});
