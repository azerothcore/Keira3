import { BroadcastText } from '@keira/shared/acore-world-model';

/** A `broadcast_text` row with its two gendered wordings collapsed into the single text we browse and copy. */
export type BroadcastTextRow = BroadcastText & { Text: string };

/** How far on either side of a unique hit we look for the lines that go with it. */
export const ADJACENT_ID_RANGE = 5;

/**
 * MaleText and FemaleText only ever differ when one of the two is left blank, so whichever one is
 * filled in is the text of the row.
 */
export function getBroadcastTextRow(row: BroadcastText): BroadcastTextRow {
  return { ...row, Text: row.MaleText || row.FemaleText };
}
