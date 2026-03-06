import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SqlEditorService } from './sql-editor.service';

describe('SqlEditorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), SqlEditorService],
    });
  });

  function setup() {
    const service = TestBed.inject(SqlEditorService);
    return { service };
  }

  it('should be created', () => {
    const { service } = setup();
    expect(service).toBeTruthy();
    expect(service.code).toBeTruthy();
  });
});
