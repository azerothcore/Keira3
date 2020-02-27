import { expect } from 'chai';
import { SpectronClient } from 'spectron';

import commonSetup from './common-setup';

describe('Keira3 App', function () {
  commonSetup.apply(this);

  let browser: any;
  let client: SpectronClient;

  beforeEach(function () {
    client = this.app.client;
    browser = client as any;
  });

  it('creates initial windows', async function () {
    const count = await client.getWindowCount();
    expect(count).to.equal(1);
  });

  it('sqlite should correctly work', async function () {
    const sleep = time => new Promise(r => setTimeout(r, time));
    const selector = '#sqlite-e2e-test';
    const expectedText = 'Tricks and Treats of Azeroth';
    const text = await browser.getAttribute(selector, 'e2e');
    await sleep(500);
    expect(text).to.equal(expectedText);
  });

});
