import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MailLootHandlerService } from './mail-loot-handler.service';

describe('MailLootHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [MailLootHandlerService],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(MailLootHandlerService)).toBeTruthy();
  });
});
