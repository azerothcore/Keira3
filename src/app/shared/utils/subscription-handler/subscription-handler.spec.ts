import { Subscription } from 'rxjs';
import { SubscriptionHandler } from './subscription-handler';

class TestClass extends SubscriptionHandler {
  addSubscription(subscription: Subscription) {
    this.subscriptions.push(subscription);
  }
}

describe('SubscriptionHandler', () => {
  function setup() {
    const object = new TestClass();
    return { object };
  }

  it('ngOnDestroy() should correctly unsubscribe all subscriptions', () => {
    const { object } = setup();
    const sub1 = new Subscription();
    const sub2 = new Subscription();
    const sub3 = new Subscription();
    const spy1 = spyOn(sub1, 'unsubscribe');
    const spy2 = spyOn(sub2, 'unsubscribe');
    const spy3 = spyOn(sub3, 'unsubscribe');
    object.addSubscription(sub1);
    object.addSubscription(sub2);
    object.addSubscription(sub3);

    object.ngOnDestroy();

    expect(spy1).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledTimes(1);
    expect(spy3).toHaveBeenCalledTimes(1);
  });
});
