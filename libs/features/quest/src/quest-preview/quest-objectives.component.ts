import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '@keira/shared/base-editor-components';
import { Observable } from 'rxjs';

export interface NpcOrGoObjective {
  text$: Observable<string | number | undefined>;
  count: string;
}

export interface ItemObjective {
  id: number | string;
  name$: Observable<string>;
  count: string;
}

export interface FactionRequirement {
  name$: Observable<string>;
  value: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-quest-objectives',
  templateUrl: './quest-objectives.component.html',
  imports: [IconComponent, AsyncPipe],
})
export class QuestObjectivesComponent {
  readonly objectiveText = input.required<string>();
  readonly areaDescription = input<string | undefined>();
  readonly npcObjectives = input<NpcOrGoObjective[]>([]);
  readonly itemObjectives = input<ItemObjective[]>([]);
  readonly factionRequirements = input<FactionRequirement[]>([]);
}
