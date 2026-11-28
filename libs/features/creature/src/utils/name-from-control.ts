import { AbstractControl } from '@angular/forms';
import { defer, distinctUntilChanged, from, Observable, of, startWith, switchMap } from 'rxjs';

export function nameFromControl(
  control: AbstractControl<number>,
  getName: (id: number) => Promise<string>,
): Observable<string | undefined> {
  // Read the value on subscribe: the editor can load the entity after this is created but before the template subscribes
  return defer(() => control.valueChanges.pipe(startWith(control.value))).pipe(
    distinctUntilChanged(),
    switchMap((id) => (id ? from(getName(id)) : of(undefined))),
  );
}
