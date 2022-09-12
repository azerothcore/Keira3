import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { SaiHandlerService } from '@keira-shared/modules/sai-editor/sai-handler.service';
import { SAI_TYPES, SAI_TYPES_KEYS, SmartScripts } from '@keira-types/smart-scripts.type';
import { FormControl, FormGroup } from 'ngx-typesafe-forms';

@Component({
  selector: 'keira-sai-search-entity',
  templateUrl: './sai-search-entity.component.html',
  styleUrls: ['./sai-search-entity.component.scss'],
})
export class SaiSearchEntityComponent {
  readonly SAI_SEARCH_TYPES = SAI_TYPES;
  readonly SAI_SEARCH_TYPES_KEYS = SAI_TYPES_KEYS;

  readonly form = new FormGroup<Partial<SmartScripts>>({
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

  get sourceTypeControl() {
    return this.form.controls.source_type as FormGroup<number>;
  }

  get entryOrGuidControl() {
    return this.form.controls.entryorguid as FormGroup<number>;
  }

  constructor(private handlerService: SaiHandlerService) {}

  onSelectedTypeChange() {
    this.entryOrGuidControl.setValue(null);
  }

  onEdit() {
    this.handlerService.selectFromEntity(this.sourceTypeControl.value, this.entryOrGuidControl.value);
  }
}
