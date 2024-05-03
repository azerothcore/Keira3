import { TestBed } from '@angular/core/testing';
import { NpcTextService } from './npc-text.service';
import { NpcTextHandlerService } from './npc-text-handler.service';
import { instance, mock } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

describe(NpcTextService.name, () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [NpcTextHandlerService, { provide: ToastrService, useValue: instance(mock(ToastrService)) }],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(NpcTextService)).toBeTruthy();
  });
});
