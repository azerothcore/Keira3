import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SqlEditorService } from './sql-editor.service';

describe('SqlEditorService', () => {
  let service: SqlEditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), SqlEditorService],
    });
    service = TestBed.inject(SqlEditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.code).toBeTruthy();
  });
});
