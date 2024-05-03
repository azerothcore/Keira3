import { TestBed } from '@angular/core/testing';
import { BroadcastTextService } from './broadcast-text.service';
import { BroadcastTextHandlerService } from './broadcast-text-handler.service';
import { instance, mock } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

describe(BroadcastTextService.name, () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [BroadcastTextHandlerService, { provide: ToastrService, useValue: instance(mock(ToastrService)) }],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(BroadcastTextService)).toBeTruthy();
  });
});
