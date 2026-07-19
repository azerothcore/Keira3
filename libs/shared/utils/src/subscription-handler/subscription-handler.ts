import { Service, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Service()
export abstract class SubscriptionHandler implements OnDestroy {
  protected subscriptions: Subscription[] = [];

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription?.unsubscribe();
    }
  }
}
