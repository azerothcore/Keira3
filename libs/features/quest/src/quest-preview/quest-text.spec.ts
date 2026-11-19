import { DEFAULT_QUEST_TEXT_SAMPLE, questText } from './quest-text';

describe('questText', () => {
  it('breaks the lines, and writes the placeholders for a sample player when given one', () => {
    const text = 'Greetings, $N the $R $c.$B$BWelcome, $G lad : lass ;.';
    expect(questText(text)).toBe('Greetings, $N the $R $c.\n\nWelcome, $G lad : lass ;.');
    expect(questText(text, DEFAULT_QUEST_TEXT_SAMPLE)).toBe('Greetings, Drok the Orc Warrior.\n\nWelcome, lad.');
    expect(questText(text, { ...DEFAULT_QUEST_TEXT_SAMPLE, female: true })).toContain('Welcome, lass.');
    expect(questText(null)).toBe('');
    expect(questText(undefined, DEFAULT_QUEST_TEXT_SAMPLE)).toBe('');
  });
});
