import { TestBed } from '@angular/core/testing';
import { AcoreTextService } from './acore-text.service';
import { AcoreTextHandlerService } from './acore-text-handler.service';
import { instance, mock } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

describe(AcoreTextService.name, () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [AcoreTextHandlerService, { provide: ToastrService, useValue: instance(mock(ToastrService)) }],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(AcoreTextService)).toBeTruthy();
  });
});
