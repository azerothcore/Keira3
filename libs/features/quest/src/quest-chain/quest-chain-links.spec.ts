import { chainLinksQuery, NO_CHAIN_LINKS } from './quest-chain-links';

describe('chainLinksQuery', () => {
  it('writes only the links changed, inserting the addon row when there is none', () => {
    expect(chainLinksQuery(5, NO_CHAIN_LINKS, NO_CHAIN_LINKS)).toBe('');
    expect(chainLinksQuery(5, NO_CHAIN_LINKS, { ...NO_CHAIN_LINKS, PrevQuestID: -4.6, ExclusiveGroup: 7 })).toBe(
      'INSERT INTO `quest_template_addon` (`ID`, `PrevQuestID`, `ExclusiveGroup`) VALUES (5, -4, 7)\n' +
        '  ON DUPLICATE KEY UPDATE `PrevQuestID` = VALUES(`PrevQuestID`), `ExclusiveGroup` = VALUES(`ExclusiveGroup`);',
    );
    expect(chainLinksQuery(5, { ...NO_CHAIN_LINKS, NextQuestID: 3 }, { ...NO_CHAIN_LINKS, NextQuestID: NaN })).toContain('VALUES (5, 0)');
  });
});
