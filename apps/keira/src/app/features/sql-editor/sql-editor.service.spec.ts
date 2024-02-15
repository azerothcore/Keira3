import { TestBed } from '@angular/core/testing';
import { SqlEditorService } from './sql-editor.service';

describe('SqlEditorService', () => {
  let service: SqlEditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SqlEditorService],
    });
    service = TestBed.inject(SqlEditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.code).toBeTruthy();
  });
});
