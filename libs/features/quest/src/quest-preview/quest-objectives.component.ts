import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '@keira/shared/base-editor-components';

export interface NpcOrGoObjective {
  text$: Promise<string>;
  count: string;
}

export interface ItemObjective {
  id: number;
  name$: Promise<string>;
  count: string;
}

export interface FactionRequirement {
  name$: Promise<string>;
  value: string;
}

@Component({
  selector: 'keira-quest-objectives',
  templateUrl: './quest-objectives.component.html',
  styleUrls: ['./quest-objectives.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IconComponent, AsyncPipe],
})
export class QuestObjectivesComponent {
  readonly objectiveText = input.required<string>();
  readonly areaDescription = input<string | undefined>();
  readonly npcObjectives = input<NpcOrGoObjective[]>([]);
  readonly itemObjectives = input<ItemObjective[]>([]);
  readonly factionRequirements = input<FactionRequirement[]>([]);
}
