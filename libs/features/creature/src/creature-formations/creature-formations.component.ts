import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreatureFormation } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureFormationsService, FormationSpawn } from './creature-formations.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-formations',
  templateUrl: './creature-formations.component.html',
  imports: [
    TopBarComponent,
    TranslateDirective,
    TranslatePipe,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    EditorButtonsComponent,
    NgxDatatableModule,
  ],
})
export class CreatureFormationsComponent extends MultiRowEditorComponent<CreatureFormation> implements OnInit {
  override readonly editorService = inject(CreatureFormationsService);
  readonly handlerService = inject(CreatureHandlerService);
  /** The creature's spawns (undefined while they're read). */
  protected readonly spawns = signal<FormationSpawn[] | undefined>(undefined);

  /**
   * The leaders whose formation can be edited, first those with one: a spawn leading one, the leader of one a spawn is
   * in, then the other spawns (to start one).
   */
  protected readonly leaders = computed(() => {
    const leaders = new Map<number, { guid: number; key: string; params: Record<string, number> }>();
    const spawns = this.spawns() as FormationSpawn[];
    for (const spawn of spawns) {
      if (spawn.leads) {
        leaders.set(spawn.guid, {
          guid: spawn.guid,
          key: 'CREATURE.FORMATION_LEADS',
          params: { guid: spawn.guid, count: spawn.leads, map: spawn.map },
        });
      }
      if (spawn.ledBy !== null && !leaders.has(spawn.ledBy)) {
        leaders.set(spawn.ledBy, {
          guid: spawn.ledBy,
          key: 'CREATURE.FORMATION_LED_BY',
          params: { guid: spawn.ledBy, member: spawn.guid },
        });
      }
    }
    // (a member of another's formation starts none of its own)
    for (const spawn of spawns) {
      if (!leaders.has(spawn.guid) && spawn.ledBy === null) {
        leaders.set(spawn.guid, { guid: spawn.guid, key: 'CREATURE.FORMATION_NONE', params: { guid: spawn.guid, map: spawn.map } });
      }
    }
    return [...leaders.values()];
  });

  override ngOnInit(): void {
    super.ngOnInit();
    this.subscriptions.push(
      this.editorService.getSpawns(this.handlerService.selected).subscribe((spawns) => {
        this.spawns.set(spawns);
        const leaders = this.leaders();
        // (a leader picked for another creature, or none: the first of this one's)
        if (!leaders.some((leader) => leader.guid === this.editorService.leader)) {
          this.pickLeader(leaders[0]?.guid);
        }
      }),
    );
  }

  protected pickLeader(guid: number | undefined): void {
    this.editorService.setLeader(guid);
    this.editorService.reload(this.changeDetectorRef, this.handlerService.selected);
  }
}
