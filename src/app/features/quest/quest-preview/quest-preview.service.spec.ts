import { TestBed } from '@angular/core/testing';

import { QuestPreviewService } from './quest-preview.service';

describe('QuestPreviewService', () => {
  let service: QuestPreviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QuestPreviewService,
      ]
    });
    service = TestBed.inject(QuestPreviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
