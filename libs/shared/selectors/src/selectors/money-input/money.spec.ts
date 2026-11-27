import { joinMoney, splitMoney, toInteger } from './money';

describe('money', () => {
  it('splitMoney() should split copper into gold, silver and copper', () => {
    expect(splitMoney(193837)).toEqual({ gold: 19, silver: 38, copper: 37 });
    expect(splitMoney(0)).toEqual({ gold: 0, silver: 0, copper: 0 });
    expect(splitMoney(99)).toEqual({ gold: 0, silver: 0, copper: 99 });
    expect(splitMoney(10000)).toEqual({ gold: 1, silver: 0, copper: 0 });
  });

  it('splitMoney() should split the absolute amount of a negative value', () => {
    expect(splitMoney(-215937)).toEqual({ gold: 21, silver: 59, copper: 37 });
  });

  it('joinMoney() should convert gold, silver and copper back to copper', () => {
    expect(joinMoney({ gold: 21, silver: 59, copper: 37 })).toEqual(215937);
    expect(joinMoney({ gold: 0, silver: 150, copper: 0 })).toEqual(15000);
  });

  it('toInteger() should turn any input into an integer', () => {
    expect(toInteger(12.9)).toEqual(12);
    expect(toInteger('42')).toEqual(42);
    expect(toInteger(null)).toEqual(0);
    expect(toInteger(undefined)).toEqual(0);
    expect(toInteger('abc')).toEqual(0);
  });
});
