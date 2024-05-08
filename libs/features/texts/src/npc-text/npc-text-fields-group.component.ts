import { ChangeDetectionStrategy, Component, computed, input, Signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EMOTE, NpcText } from '@keira/shared/acore-world-model';
import { QueryOutputComponent } from '@keira/shared/base-editor-components';
import { LanguageSelectorBtnComponent, SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { ModelForm } from '@keira/shared/utils';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './npc-text-fields-group.component.html',
  selector: 'keira-npc-text-fields-group',
  standalone: true,
  imports: [
    TranslateModule,
    QueryOutputComponent,
    ReactiveFormsModule,
    SingleValueSelectorBtnComponent,
    TooltipModule,
    LanguageSelectorBtnComponent,
  ],
})
export class NpcTextFieldsGroupComponent {
  formGroup = input.required<FormGroup<ModelForm<NpcText>>>();
  groupId = input.required<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7>();

  protected readonly text0 = computed(() => `text${this.groupId()}_0`);
  protected readonly text1 = computed(() => `text${this.groupId()}_1`);
  protected readonly broadcastTextId = computed(() => `BroadcastTextID${this.groupId()}`);
  protected readonly lang = computed(() => `lang${this.groupId()}`);
  protected readonly probability = computed(() => `Probability${this.groupId()}`);
  protected readonly em0 = computed(() => `em${this.groupId()}_0`);
  protected readonly em1 = computed(() => `em${this.groupId()}_1`);
  protected readonly em2 = computed(() => `em${this.groupId()}_2`);
  protected readonly em3 = computed(() => `em${this.groupId()}_3`);
  protected readonly em4 = computed(() => `em${this.groupId()}_4`);
  protected readonly em5 = computed(() => `em${this.groupId()}_5`);

  protected readonly text0Control = this.getControl(this.text0);
  protected readonly text1Control = this.getControl(this.text1);
  protected readonly broadcastTextIdControl = this.getControl(this.broadcastTextId);
  protected readonly langControl = this.getControl(this.lang);
  protected readonly probabilityControl = this.getControl(this.probability);
  protected readonly em0Control = this.getControl(this.em0);
  protected readonly em1Control = this.getControl(this.em1);
  protected readonly em2Control = this.getControl(this.em2);
  protected readonly em3Control = this.getControl(this.em3);
  protected readonly em4Control = this.getControl(this.em4);
  protected readonly em5Control = this.getControl(this.em5);

  protected readonly EMOTE = EMOTE;

  private getControl(controlName: Signal<string>): Signal<FormControl> {
    return computed(() => this.formGroup().get(controlName()) as FormControl);
  }
}
