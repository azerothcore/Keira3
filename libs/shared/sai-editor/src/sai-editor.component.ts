import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  CONDITION_SOURCE_TYPES,
  EVENT_PHASE_MASK,
  SAI_TYPES,
  SMART_ACTION_CAST_FLAGS,
  SMART_ACTION_CAST_TRIGGERED_FLAGS,
  SMART_EVENT_FLAGS,
  SmartScripts,
} from '@keira/shared/acore-world-model';
import {
  SAI_ACTION_PARAM1_NAMES,
  SAI_ACTION_PARAM1_TOOLTIPS,
  SAI_ACTION_PARAM2_NAMES,
  SAI_ACTION_PARAM2_TOOLTIPS,
  SAI_ACTION_PARAM3_NAMES,
  SAI_ACTION_PARAM3_TOOLTIPS,
  SAI_ACTION_PARAM4_NAMES,
  SAI_ACTION_PARAM4_TOOLTIPS,
  SAI_ACTION_PARAM5_NAMES,
  SAI_ACTION_PARAM5_TOOLTIPS,
  SAI_ACTION_PARAM6_NAMES,
  SAI_ACTION_PARAM6_TOOLTIPS,
  SAI_ACTION_TOOLTIPS,
  SAI_ACTIONS,
  SAI_ACTIONS_KEYS,
} from './constants/sai-actions';
import {
  SAI_EVENT_PARAM1_NAMES,
  SAI_EVENT_PARAM1_TOOLTIPS,
  SAI_EVENT_PARAM2_NAMES,
  SAI_EVENT_PARAM2_TOOLTIPS,
  SAI_EVENT_PARAM3_NAMES,
  SAI_EVENT_PARAM3_TOOLTIPS,
  SAI_EVENT_PARAM4_NAMES,
  SAI_EVENT_PARAM4_TOOLTIPS,
  SAI_EVENT_PARAM5_NAMES,
  SAI_EVENT_PARAM5_TOOLTIPS,
  SAI_EVENT_PARAM6_NAMES,
  SAI_EVENT_PARAM6_TOOLTIPS,
  SAI_EVENT_TOOLTIPS,
  SAI_EVENTS,
  SAI_EVENTS_KEYS,
} from './constants/sai-event';
import {
  SAI_TARGET_O_NAMES,
  SAI_TARGET_O_TOOLTIPS,
  SAI_TARGET_PARAM1_NAMES,
  SAI_TARGET_PARAM1_TOOLTIPS,
  SAI_TARGET_PARAM2_NAMES,
  SAI_TARGET_PARAM2_TOOLTIPS,
  SAI_TARGET_PARAM3_NAMES,
  SAI_TARGET_PARAM3_TOOLTIPS,
  SAI_TARGET_PARAM4_NAMES,
  SAI_TARGET_PARAM4_TOOLTIPS,
  SAI_TARGET_TOOLTIPS,
  SAI_TARGET_X_NAMES,
  SAI_TARGET_X_TOOLTIPS,
  SAI_TARGET_Y_NAMES,
  SAI_TARGET_Y_TOOLTIPS,
  SAI_TARGET_Z_NAMES,
  SAI_TARGET_Z_TOOLTIPS,
  SAI_TARGETS,
  SAI_TARGETS_KEYS,
} from './constants/sai-targets';
import { SaiEditorService } from './sai-editor.service';
import { SaiHandlerService } from './sai-handler.service';
import { TimedActionlistComponent } from './timed-actionlist/timed-actionlist.component';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SaiTopBarComponent } from './sai-top-bar/sai-top-bar.component';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { FlagsSelectorBtnComponent } from '@keira/shared/selectors';
import { EditorButtonsComponent, QueryOutputComponent } from '@keira/shared/base-editor-components';
import { SMART_EVENT_CONDITION_GROUP_OFFSET } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { AsyncPipe } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sai-editor',
  templateUrl: './sai-editor.component.html',
  styleUrls: ['./sai-editor.component.scss'],
  imports: [
    SaiTopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    FlagsSelectorBtnComponent,
    EditorButtonsComponent,
    NgxDatatableModule,
    TimedActionlistComponent,
    AsyncPipe,
  ],
})
export class SaiEditorComponent extends MultiRowEditorComponent<SmartScripts> implements OnInit {
  public override readonly editorService = inject(SaiEditorService);
  protected override readonly handlerService = inject(SaiHandlerService);
  private readonly mysqlQueryService = inject(MysqlQueryService);
  private readonly router = inject(Router);

  readonly EVENT_PHASE_MASK = EVENT_PHASE_MASK;
  readonly SMART_EVENT_FLAGS = SMART_EVENT_FLAGS;
  readonly SMART_ACTION_CAST_FLAGS = SMART_ACTION_CAST_FLAGS;
  readonly SMART_ACTION_CAST_TRIGGERED_FLAGS = SMART_ACTION_CAST_TRIGGERED_FLAGS;
  readonly SAI_EVENTS = SAI_EVENTS;
  readonly SAI_EVENTS_KEYS = SAI_EVENTS_KEYS;
  readonly SAI_ACTIONS = SAI_ACTIONS;
  readonly SAI_ACTIONS_KEYS = SAI_ACTIONS_KEYS;
  readonly SAI_TARGETS = SAI_TARGETS;
  readonly SAI_TARGETS_KEYS = SAI_TARGETS_KEYS;
  readonly SAI_EVENT_TOOLTIPS = SAI_EVENT_TOOLTIPS;
  readonly SAI_ACTION_TOOLTIPS = SAI_ACTION_TOOLTIPS;
  readonly SAI_TARGET_TOOLTIPS = SAI_TARGET_TOOLTIPS;
  readonly EVENT_PARAM1_NAMES = SAI_EVENT_PARAM1_NAMES;
  readonly EVENT_PARAM2_NAMES = SAI_EVENT_PARAM2_NAMES;
  readonly EVENT_PARAM3_NAMES = SAI_EVENT_PARAM3_NAMES;
  readonly EVENT_PARAM4_NAMES = SAI_EVENT_PARAM4_NAMES;
  readonly EVENT_PARAM5_NAMES = SAI_EVENT_PARAM5_NAMES;
  readonly EVENT_PARAM6_NAMES = SAI_EVENT_PARAM6_NAMES;
  readonly ACTION_PARAM1_NAMES = SAI_ACTION_PARAM1_NAMES;
  readonly ACTION_PARAM2_NAMES = SAI_ACTION_PARAM2_NAMES;
  readonly ACTION_PARAM3_NAMES = SAI_ACTION_PARAM3_NAMES;
  readonly ACTION_PARAM4_NAMES = SAI_ACTION_PARAM4_NAMES;
  readonly ACTION_PARAM5_NAMES = SAI_ACTION_PARAM5_NAMES;
  readonly ACTION_PARAM6_NAMES = SAI_ACTION_PARAM6_NAMES;
  readonly TARGET_PARAM1_NAMES = SAI_TARGET_PARAM1_NAMES;
  readonly TARGET_PARAM2_NAMES = SAI_TARGET_PARAM2_NAMES;
  readonly TARGET_PARAM3_NAMES = SAI_TARGET_PARAM3_NAMES;
  readonly TARGET_PARAM4_NAMES = SAI_TARGET_PARAM4_NAMES;
  readonly TARGET_X_NAMES = SAI_TARGET_X_NAMES;
  readonly TARGET_Y_NAMES = SAI_TARGET_Y_NAMES;
  readonly TARGET_Z_NAMES = SAI_TARGET_Z_NAMES;
  readonly TARGET_O_NAMES = SAI_TARGET_O_NAMES;
  readonly EVENT_PARAM1_TOOLTIPS = SAI_EVENT_PARAM1_TOOLTIPS;
  readonly EVENT_PARAM2_TOOLTIPS = SAI_EVENT_PARAM2_TOOLTIPS;
  readonly EVENT_PARAM3_TOOLTIPS = SAI_EVENT_PARAM3_TOOLTIPS;
  readonly EVENT_PARAM4_TOOLTIPS = SAI_EVENT_PARAM4_TOOLTIPS;
  readonly EVENT_PARAM5_TOOLTIPS = SAI_EVENT_PARAM5_TOOLTIPS;
  readonly EVENT_PARAM6_TOOLTIPS = SAI_EVENT_PARAM6_TOOLTIPS;
  readonly ACTION_PARAM1_TOOLTIPS = SAI_ACTION_PARAM1_TOOLTIPS;
  readonly ACTION_PARAM2_TOOLTIPS = SAI_ACTION_PARAM2_TOOLTIPS;
  readonly ACTION_PARAM3_TOOLTIPS = SAI_ACTION_PARAM3_TOOLTIPS;
  readonly ACTION_PARAM4_TOOLTIPS = SAI_ACTION_PARAM4_TOOLTIPS;
  readonly ACTION_PARAM5_TOOLTIPS = SAI_ACTION_PARAM5_TOOLTIPS;
  readonly ACTION_PARAM6_TOOLTIPS = SAI_ACTION_PARAM6_TOOLTIPS;
  readonly TARGET_PARAM1_TOOLTIPS = SAI_TARGET_PARAM1_TOOLTIPS;
  readonly TARGET_PARAM2_TOOLTIPS = SAI_TARGET_PARAM2_TOOLTIPS;
  readonly TARGET_PARAM3_TOOLTIPS = SAI_TARGET_PARAM3_TOOLTIPS;
  readonly TARGET_PARAM4_TOOLTIPS = SAI_TARGET_PARAM4_TOOLTIPS;
  readonly TARGET_X_TOOLTIPS = SAI_TARGET_X_TOOLTIPS;
  readonly TARGET_Y_TOOLTIPS = SAI_TARGET_Y_TOOLTIPS;
  readonly TARGET_Z_TOOLTIPS = SAI_TARGET_Z_TOOLTIPS;
  readonly TARGET_O_TOOLTIPS = SAI_TARGET_O_TOOLTIPS;

  get selectedEvent(): number {
    return this.editorService.form.controls.event_type.value;
  }

  get selectedAction(): number {
    return this.editorService.form.controls.action_type.value;
  }

  get selectedTarget(): number {
    return this.editorService.form.controls.target_type.value;
  }

  get isTimedActionlists(): boolean {
    return this.handlerService.parsedSelected.source_type === SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST;
  }

  get showTimedActionlists(): boolean {
    return (
      this.handlerService.parsedSelected.source_type === SAI_TYPES.SAI_TYPE_CREATURE && this.handlerService.parsedSelected.entryorguid > 0
    );
  }

  get entryOrGuid(): number {
    return this.handlerService.parsedSelected.entryorguid as number;
  }

  getName(defaultParamName: string, value: string | undefined): string {
    return value ? value : defaultParamName;
  }

  getHandler(): SaiHandlerService {
    return this.handlerService;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    void this.loadConditionCounts();
  }

  /** One query per script rather than per row: the whole script's condition counts, keyed by `smart_scripts.id`. */
  private async loadConditionCounts(): Promise<void> {
    const { entryorguid, source_type } = this.handlerService.parsedSelected;
    const counts: Record<number, number> = {};

    try {
      const rows = await this.mysqlQueryService.getSmartEventConditionCounts(entryorguid, source_type);

      for (const row of rows) {
        // conditions.SourceGroup is the event id shifted by one; shift it back to match smart_scripts.id.
        counts[Number(row.SourceGroup) - SMART_EVENT_CONDITION_GROUP_OFFSET] = Number(row.conditionCount);
      }
    } catch (error) {
      // A supplementary marker must never take the editor down with it; just show no markers.
      console.warn('Could not load SmartAI condition counts', error);
    }

    this.conditionCounts.set(counts);
    this.changeDetectorRef.markForCheck();
  }

  protected readonly conditionCounts = signal<Record<number, number>>({});

  conditionCountFor(row: SmartScripts): number {
    return this.conditionCounts()[Number(row.id)] ?? 0;
  }

  /** The `conditions` key that addresses the given SmartAI event. */
  private conditionQueryParams(eventId: string | number): Record<string, number> {
    const { entryorguid, source_type } = this.handlerService.parsedSelected;

    return {
      sourceType: CONDITION_SOURCE_TYPES.SOURCE_TYPE_SMART_EVENT,
      sourceEntry: entryorguid,
      sourceGroup: Number(eventId) + SMART_EVENT_CONDITION_GROUP_OFFSET,
      // The core keys smart event conditions on (SourceEntry, SourceId), so SourceId must carry the
      // script's source_type - otherwise a gameobject script would address the creature one.
      sourceId: source_type,
    };
  }

  /** Opens the Conditions search prefilled with the conditions attached to this SmartAI event. */
  openConditions(row: SmartScripts, event: Event): void {
    // Otherwise the datatable would also treat this as a row selection.
    event.stopPropagation();

    void this.router.navigate(['conditions/select'], { queryParams: this.conditionQueryParams(row.id) });
  }

  /** Opens the Conditions editor in "new" mode for the selected event, with its key already filled in. */
  createConditionForSelectedRow(): void {
    void this.router.navigate(['conditions/select'], {
      queryParams: { ...this.conditionQueryParams(this.editorService.selectedRowId as string | number), create: true },
    });
  }
}
