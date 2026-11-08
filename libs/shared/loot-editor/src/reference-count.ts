import { AbstractControl, FormGroup } from '@angular/forms';
import { merge, Subscription } from 'rxjs';

/**
 * A reference row (`Reference` set) drops its reference's loot `MaxCount` times: AzerothCore doesn't support a
 * different `MinCount` for it (and reports one at startup), so `MinCount` follows `MaxCount` on those rows.
 */
export function syncReferenceCount(form: FormGroup): Subscription {
  const controls = form.controls as Record<'Reference' | 'MinCount' | 'MaxCount', AbstractControl>;
  return merge(controls.Reference.valueChanges, controls.MaxCount.valueChanges).subscribe(() => {
    const max = controls.MaxCount.value;
    if (Number(controls.Reference.value) !== 0 && controls.MinCount.value !== max) {
      controls.MinCount.setValue(max);
    }
  });
}
