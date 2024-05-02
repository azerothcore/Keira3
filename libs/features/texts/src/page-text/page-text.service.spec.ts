import { TestBed } from '@angular/core/testing';
import { PageTextService } from './page-text.service';
import { PageTextHandlerService } from './page-text-handler.service';
import { instance, mock } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

describe(PageTextService.name, () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [PageTextHandlerService, { provide: ToastrService, useValue: instance(mock(ToastrService)) }],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(PageTextService)).toBeTruthy();
  });
});
