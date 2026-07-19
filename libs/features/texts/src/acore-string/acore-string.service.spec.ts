import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AcoreStringService } from './acore-string.service';
import { AcoreStringHandlerService } from './acore-string-handler.service';
import { instance, mock } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

describe(AcoreStringService.name, () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        AcoreStringHandlerService,
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(AcoreStringService)).toBeTruthy();
  });
});
