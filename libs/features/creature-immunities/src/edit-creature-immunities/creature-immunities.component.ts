import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  CreatureImmunities,
  DISPEL_TYPE_MASK,
  MECHANIC_IMMUNITIES_MASK,
  SPELL_DBC_APPLY_AURA_NAME,
  SPELL_DBC_EFFECT,
  SPELL_SCHOOL_MASK,
} from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { FlagsSelectorBtnComponent, OptionsSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { CreatureImmunitiesHandlerService } from '../creature-immunities-handler.service';
import { CreatureImmunitiesCommentService } from './creature-immunities-comment.service';
import { CreatureImmunitiesService } from './creature-immunities.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-immunities',
  templateUrl: './creature-immunities.component.html',
  imports: [
    TopBarComponent,
    TranslateDirective,
    TranslatePipe,
    FormsModule,
    ReactiveFormsModule,
    TooltipDirective,
    QueryOutputComponent,
    FlagsSelectorBtnComponent,
    OptionsSelectorBtnComponent,
  ],
})
export class CreatureImmunitiesComponent extends SingleRowEditorComponent<CreatureImmunities> {
  protected override readonly editorService = inject(CreatureImmunitiesService);
  protected readonly handlerService = inject(CreatureImmunitiesHandlerService);

  private readonly commentService = inject(CreatureImmunitiesCommentService);

  protected readonly SPELL_SCHOOL_MASK = SPELL_SCHOOL_MASK;
  protected readonly DISPEL_TYPE_MASK = DISPEL_TYPE_MASK;
  protected readonly MECHANIC_IMMUNITIES_MASK = MECHANIC_IMMUNITIES_MASK;
  // The `NONE` (0) entry is never stored in these CSV columns, so it is not offered.
  protected readonly EFFECTS_OPTIONS = SPELL_DBC_EFFECT.filter((option) => option.value !== 0);
  protected readonly AURAS_OPTIONS = SPELL_DBC_APPLY_AURA_NAME.filter((option) => option.value !== 0);

  setBooleanFlag(field: 'ImmuneAoE' | 'ImmuneChain', event: Event): void {
    const control = this.editorService.form.controls[field];
    control.markAsDirty(); // BEFORE setValue: the base class only recomputes the diff while the form is dirty
    control.setValue((event.target as HTMLInputElement).checked ? 1 : 0);
  }

  generateComment(): void {
    const control = this.editorService.form.controls.Comment;
    control.markAsDirty();
    control.setValue(this.commentService.generate(this.editorService.form.getRawValue() as CreatureImmunities));
  }
}
