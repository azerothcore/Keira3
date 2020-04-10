import { TestBed } from '@angular/core/testing';

import { QuestPreviewService } from './quest-preview.service';
import { QuestModule } from '../quest.module';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestTemplateService } from '../quest-template/quest-template.service';

describe('QuestPreviewService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        QuestModule,
      ],
      providers: [
        QuestTemplateService,
      ]
    });
  });

  const setup = () => {
    const service = TestBed.inject(QuestPreviewService);
    const questTemplateService = TestBed.inject(QuestTemplateService);

    return { service, questTemplateService };
  };

  it('handle questTemplate values', () => {
    const { service, questTemplateService } = setup();

    const mockTitle = 'Test';
    const questLevel = 80;
    const minLevel = 10;
    const mockRaces = 123;

    questTemplateService.form.controls.LogTitle.setValue(mockTitle);
    questTemplateService.form.controls.QuestLevel.setValue(questLevel);
    questTemplateService.form.controls.MinLevel.setValue(minLevel);
    questTemplateService.form.controls.AllowableRaces.setValue(mockRaces);

    expect(service.title).toBe(mockTitle);
    expect(service.level).toBe(String(questLevel));
    expect(service.minLevel).toBe(String(minLevel));
    expect(service.side).toBeNull();
    expect(service.races).toBe('Human,Orc,Night Elf,Undead,Tauren,Gnome');

    questTemplateService.form.controls.AllowableRaces.setValue(null);
    expect(service.races).toBeUndefined();
  });
});
