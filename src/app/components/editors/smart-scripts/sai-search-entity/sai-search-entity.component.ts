import { Component, } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { SaiHandlerService } from '../../../../services/handlers/sai-handler.service';
import { SAI_SEARCH_TYPES, SAI_SEARCH_TYPES_KEYS } from '../../../../types/smart-scripts.type';

@Component({
  selector: 'app-sai-search-entity',
  templateUrl: './sai-search-entity.component.html',
  styleUrls: ['./sai-search-entity.component.scss']
})
export class SaiSearchEntityComponent {

  public readonly SAI_SEARCH_TYPES = SAI_SEARCH_TYPES;
  public readonly SAI_SEARCH_TYPES_KEYS = SAI_SEARCH_TYPES_KEYS;

  public readonly form = new FormGroup({
    'source_type': new FormControl(null, [Validators.required]),
    'entryorguid': new FormControl(null, [Validators.required]),
  });

  get typeCreatureSelected(): boolean {
    return this.sourceTypeControl.value === SAI_SEARCH_TYPES.SAI_TYPE_CREATURE;
  }

  get typeGameobjectSelected(): boolean {
    return this.sourceTypeControl.value === SAI_SEARCH_TYPES.SAI_TYPE_GAMEOBJECT;
  }

  get sourceTypeControl(): AbstractControl {
    return this.form.get('source_type');
  }

  get entryOrGuidControl(): AbstractControl {
    return this.form.get('entryorguid');
  }

  constructor(
    private handlerService: SaiHandlerService,
  ) {}

  onSelectedTypeChange() {
    this.entryOrGuidControl.setValue('');
  }

  onEdit() {
    this.handlerService.selectFromEntity(this.sourceTypeControl.value, this.entryOrGuidControl.value);
  }
}
