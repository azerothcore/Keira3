import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestHandlerService } from './quest-handler.service';

describe('QuestHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [QuestHandlerService],
    }),
  );

  it('should be created', () => {
    const service: QuestHandlerService = TestBed.inject(QuestHandlerService);
    expect(service).toBeTruthy();
  });
});
