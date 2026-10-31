import { SmartScripts } from '@keira/shared/acore-world-model';
import { checkSmartScripts } from './sai-checks';

const row = (id: number, extra: Partial<SmartScripts> = {}): SmartScripts => Object.assign(new SmartScripts(), { id, ...extra });

describe('checkSmartScripts', () => {
  it('finds nothing wrong in a plain script', () => {
    expect(
      checkSmartScripts([row(0, { event_param1: 1000, event_param2: 2000 }), row(1, { link: 2 }), row(2, { event_type: 61 })]),
    ).toEqual([]);
  });

  it('finds timers with min above max, in timed events and actionlists only', () => {
    expect(
      checkSmartScripts([
        row(0, { event_param1: 5, event_param2: 1 }),
        row(1, { event_type: 1, event_param3: 9, event_param4: 2 }),
        row(2, { event_type: 4, event_param1: 5, event_param2: 1 }),
        row(3, { source_type: 9, event_type: 4, event_param1: 5, event_param2: 1 }),
      ]),
    ).toEqual([{ key: 'MIN_MAX', ids: [0, 1, 3] }]);
  });

  it('finds phases out of range or never set (a chance of 0 is no roll: the row always runs)', () => {
    expect(checkSmartScripts([row(0, { event_phase_mask: 0x1000 }), row(1, { event_phase_mask: 2 }), row(2, { event_chance: 0 })])).toEqual(
      [
        { key: 'PHASE_MASK', ids: [0] },
        { key: 'PHASE_NEVER_SET', ids: [1] },
      ],
    );
    expect(checkSmartScripts([row(0, { event_phase_mask: 2 }), row(1, { action_type: 22, action_param1: 2 })])).toEqual([]);
    // the phase may be set by an actionlist the script calls
    for (const action_type of [80, 87, 88]) {
      expect(checkSmartScripts([row(0, { event_phase_mask: 2 }), row(1, { action_type, action_param1: 100 })])).toEqual([]);
    }
  });

  it('finds broken links', () => {
    expect(
      checkSmartScripts([
        row(0, { link: 0 }),
        row(1, { link: 1 }),
        row(2, { link: 9 }),
        row(3, { link: 0, event_type: 4 }),
        row(4, { link: 3 }),
        row(5, { event_type: 61 }),
        row(6, { source_type: 9, event_type: 61 }),
      ]),
    ).toEqual([
      { key: 'LINK_SELF', ids: [1] },
      { key: 'LINK_MISSING', ids: [2] },
      { key: 'LINK_NOT_LINK_EVENT', ids: [4] },
      { key: 'LINK_ORPHAN', ids: [5] },
    ]);
  });

  it('finds actions that do nothing or are refused', () => {
    expect(
      checkSmartScripts([
        row(0, { action_type: 22, action_param1: 13 }),
        row(1, { action_type: 23 }),
        row(2, { action_type: 23, action_param2: 1 }),
        row(3, { action_type: 80 }),
        row(4, { action_type: 80, action_param1: 4600 }),
      ]),
    ).toEqual([
      { key: 'SET_PHASE_RANGE', ids: [0] },
      { key: 'INC_PHASE_ZERO', ids: [1] },
      { key: 'ACTIONLIST_ZERO', ids: [3] },
    ]);
  });
});
