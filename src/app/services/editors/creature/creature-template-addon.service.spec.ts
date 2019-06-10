import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CreatureTemplateAddonService } from './creature-template-addon.service';

describe('CreatureTemplateAddonService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ]
  }));

  it('should be created', () => {
    const service: CreatureTemplateAddonService = TestBed.get(CreatureTemplateAddonService);
    expect(service).toBeTruthy();
  });
});
