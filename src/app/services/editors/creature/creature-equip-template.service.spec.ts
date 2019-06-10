import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CreatureEquipTemplateService } from './creature-equip-template.service';

describe('CreatureEquipTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ]
  }));

  it('should be created', () => {
    const service: CreatureEquipTemplateService = TestBed.get(CreatureEquipTemplateService);
    expect(service).toBeTruthy();
  });
});
