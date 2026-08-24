import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '@keira/shared/base-editor-components';
import { NpcOrGoObjective, ItemObjective, FactionRequirement } from './quest-objectives.model';

@Component({
  selector: 'keira-quest-objectives',
  templateUrl: './quest-objectives.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, AsyncPipe],
})
export class QuestObjectivesComponent {
  readonly objectiveText = input.required<string>();
  readonly areaDescription = input<string | undefined>();
  readonly npcObjectives = input<NpcOrGoObjective[]>([]);
  readonly itemObjectives = input<ItemObjective[]>([]);
  readonly factionRequirements = input<FactionRequirement[]>([]);
}
