/** The player the preview's texts are written for, when asked (#3133). */
export interface QuestTextSample {
  name: string;
  race: string;
  className: string;
  /** Which form of `$g male:female;` is shown. */
  female: boolean;
}

export const QUEST_TEXT_SAMPLE_KEY = 'keira3.questPreviewSample';
export const DEFAULT_QUEST_TEXT_SAMPLE: QuestTextSample = { name: 'Drok', race: 'Orc', className: 'Warrior', female: false };

/**
 * A quest text as the client shows it: `$B` a line break and, with a sample player, `$N` its name, `$R` its race, `$C`
 * its class and `$G male:female;` the form of its gender (any case).
 */
export function questText(text: string | null | undefined, sample?: QuestTextSample): string {
  const lines = (text ?? '').replace(/\$B/gi, '\n');
  if (!sample) {
    return lines;
  }
  return lines
    .replace(/\$G\s*([^:;]*):([^;]*);/gi, (_, male: string, female: string) => (sample.female ? female : male).trim())
    .replace(/\$N/gi, sample.name)
    .replace(/\$R/gi, sample.race)
    .replace(/\$C/gi, sample.className);
}
