import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CreatureTemplateService } from './creature-template.service';

describe('CreatureTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ]
  }));

  it('should be created', () => {
    const service: CreatureTemplateService = TestBed.get(CreatureTemplateService);
    expect(service).toBeTruthy();
  });
});
