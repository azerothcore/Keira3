import { TestBed } from '@angular/core/testing';

import { QuestPreviewService } from './quest-preview.service';
import { QuestModule } from '../quest.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('QuestPreviewService', () => {
  let service: QuestPreviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        QuestModule,
      ]
    });
    service = TestBed.inject(QuestPreviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
