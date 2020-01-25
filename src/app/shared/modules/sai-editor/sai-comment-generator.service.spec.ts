import { TestBed } from '@angular/core/testing';

import { SaiCommentGeneratorService } from './sai-comment-generator.service';

describe('SaiCommentGeneratorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SaiCommentGeneratorService = TestBed.get(SaiCommentGeneratorService);
    expect(service).toBeTruthy();
  });
});
