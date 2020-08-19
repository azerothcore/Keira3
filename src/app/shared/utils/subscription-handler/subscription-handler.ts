import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// TODO: Add Angular decorator.
export abstract class SubscriptionHandler implements OnDestroy {
  protected subscriptions: Subscription[] = [];

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
