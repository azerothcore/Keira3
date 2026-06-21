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
