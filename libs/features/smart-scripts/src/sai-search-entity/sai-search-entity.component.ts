import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SAI_TYPES, SmartScripts } from '@keira/shared/acore-world-model';
import { GameobjectSelectorBtnComponent } from '@keira/shared/selectors';
import { CreatureSelectorBtnComponent } from '@keira/shared/selectors';

import { SaiHandlerService } from '@keira/shared/sai-editor';
import { getEnumKeys, ModelForm } from '@keira/shared/utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sai-search-entity',
  templateUrl: './sai-search-entity.component.html',
  styleUrls: ['./sai-search-entity.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CreatureSelectorBtnComponent, GameobjectSelectorBtnComponent],
})
export class SaiSearchEntityComponent {
  private readonly handlerService = inject(SaiHandlerService);

  readonly SAI_SEARCH_TYPES = SAI_TYPES;
  readonly SAI_SEARCH_TYPES_KEYS = getEnumKeys(SAI_TYPES);

  readonly form = new FormGroup<ModelForm<Partial<SmartScripts>>>({
    source_type: new FormControl<number>(null, [Validators.required]),
    entryorguid: new FormControl<number>(null, [Validators.required]),
  });

  get isTypeCreatureSelected(): boolean {
    return this.sourceTypeControl.value === SAI_TYPES.SAI_TYPE_CREATURE;
  }

  get isTypeGameobjectSelected(): boolean {
    return this.sourceTypeControl.value === SAI_TYPES.SAI_TYPE_GAMEOBJECT;
  }

  get isTypeAreatriggerSelected(): boolean {
    return this.sourceTypeControl.value === SAI_TYPES.SAI_TYPE_AREATRIGGER;
  }

  get isTypeTimedActionlistsSelected(): boolean {
    return this.sourceTypeControl.value === SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST;
  }

  get sourceTypeControl(): FormControl<number> {
    return this.form.controls.source_type;
  }

  get entryOrGuidControl(): FormControl<number> {
    return this.form.controls.entryorguid;
  }

  onSelectedTypeChange() {
    this.entryOrGuidControl.setValue(null);
  }

  onEdit() {
    this.handlerService.selectFromEntity(this.sourceTypeControl.value, this.entryOrGuidControl.value);
  }
}
