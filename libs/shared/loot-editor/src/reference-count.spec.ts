import { FormControl, FormGroup } from '@angular/forms';
import { syncReferenceCount } from './reference-count';

describe('syncReferenceCount', () => {
  it('keeps MinCount at MaxCount on reference rows only', () => {
    const form = new FormGroup({ Reference: new FormControl(0), MinCount: new FormControl(1), MaxCount: new FormControl(1) });
    const subscription = syncReferenceCount(form);
    form.controls.MaxCount.setValue(3);
    expect(form.controls.MinCount.value).toBe(1);
    form.controls.Reference.setValue(10001);
    expect(form.controls.MinCount.value).toBe(3);
    form.controls.MaxCount.setValue(2);
    expect(form.controls.MinCount.value).toBe(2);
    form.controls.MaxCount.setValue(2);
    expect(form.controls.MinCount.value).toBe(2);
    subscription.unsubscribe();
  });
});
