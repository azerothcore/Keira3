import { DbcFile } from './dbc';

/** M2 attachment points (M2Attachment.id) where items go on a character. */
export const ATTACH_SHIELD = 0;
export const ATTACH_HAND_RIGHT = 1;
export const ATTACH_HAND_LEFT = 2;
export const ATTACH_SHOULDER_RIGHT = 5;
export const ATTACH_SHOULDER_LEFT = 6;
export const ATTACH_HEAD = 11;

/** A model worn at an attachment point of a character (helmet, shoulders, weapons). */
export interface ModelAttachment {
  point: number;
  model: string;
  texture?: string;
}

/** ItemDisplayInfo.dbc: what an item looks like on a character. */
export interface ItemDisplay {
  /** Its models (helmet / left shoulder / weapon, then right shoulder) and their textures, without folder or extension. */
  models: [string, string];
  textures: [string, string];
  /** Geoset variants it sets (which group depends on the slot). */
  geosetGroups: [number, number, number];
  /** HelmetGeosetVisData ids, for male and female characters: what a helmet hides. */
  helmetVis: [number, number];
}

/** The slots of CreatureDisplayInfoExtra.NPCItemDisplay, in order. */
export const NPC_ITEM_SLOTS = ['head', 'shoulder', 'shirt', 'chest', 'belt', 'legs', 'boots', 'wrist', 'gloves', 'tabard', 'cape'] as const;
export type NpcItemSlot = (typeof NPC_ITEM_SLOTS)[number];

/** Prefix of a race's item models (`Helm_Plate_D_01_HuM.m2`). */
const RACE_PREFIX: Record<number, string> = { 1: 'Hu', 2: 'Or', 3: 'Dw', 4: 'Ni', 5: 'Sc', 6: 'Ta', 7: 'Gn', 8: 'Tr', 10: 'Be', 11: 'Dr' };

const baseName = (file: string): string => file.replace(/\.(mdx|mdl|m2|blp)$/i, '');

/** ItemDisplayInfo.dbc (0 ID, 1..2 ModelName, 3..4 ModelTexture, 7..9 GeosetGroup, 13..14 HelmetGeosetVis). */
export function parseItemDisplays(dbc: DbcFile): Map<number, ItemDisplay> {
  const displays = new Map<number, ItemDisplay>();
  for (let r = 0; r < dbc.recordCount; r++) {
    displays.set(dbc.getUint(r, 0), {
      models: [dbc.getString(r, 1), dbc.getString(r, 2)],
      textures: [dbc.getString(r, 3), dbc.getString(r, 4)],
      geosetGroups: [dbc.getUint(r, 7), dbc.getUint(r, 8), dbc.getUint(r, 9)],
      helmetVis: [dbc.getUint(r, 13), dbc.getUint(r, 14)],
    });
  }
  return displays;
}

/** CharacterFacialHairStyles.dbc (0 Race, 1 Sex, 2 Variation, 3..5 Geoset: beard 1xx, moustache 3xx, sideburns 2xx). */
export function parseFacialHair(dbc: DbcFile): Map<string, [number, number, number]> {
  const styles = new Map<string, [number, number, number]>();
  for (let r = 0; r < dbc.recordCount; r++) {
    styles.set(`${dbc.getUint(r, 0)}:${dbc.getUint(r, 1)}:${dbc.getUint(r, 2)}`, [dbc.getUint(r, 3), dbc.getUint(r, 4), dbc.getUint(r, 5)]);
  }
  return styles;
}

/** HelmetGeosetVisData.dbc (0 ID, 1..7 races hiding: hair, beard, sideburns, moustache, ears, eyebrows, ?) as race masks. */
export function parseHelmetVis(dbc: DbcFile): Map<number, number[]> {
  const rows = new Map<number, number[]>();
  for (let r = 0; r < dbc.recordCount; r++) {
    rows.set(
      dbc.getUint(r, 0),
      [1, 2, 3, 4, 5, 6, 7].map((field) => dbc.getUint(r, field)),
    );
  }
  return rows;
}

/** The geoset groups a helmet's HelmetGeosetVisData masks hide, in order (hair is group 0). */
const HELMET_HIDES = [0, 1, 2, 3, 7, 17];

export interface CharacterLook {
  race: number;
  sex: number;
  /** CharHairGeosets.Geoset of the hair style (0: bald). */
  hair: number;
  /** Facial hair geosets (beard, moustache, sideburns), default 1 each. */
  facial?: [number, number, number];
  /** The items worn, by slot (shown with equipment). */
  items?: Partial<Record<NpcItemSlot, ItemDisplay>>;
  helmetVis?: Map<number, number[]>;
}

/**
 * The geosets a character model draws: the body, the bald scalp under any hair, the hair style, facial hair, ears,
 * and for each other group its first variant, or the one the items worn choose (gloves, boots, sleeves, robe, cape…).
 * A helmet hides what its HelmetGeosetVisData says for the race (hair, ears…).
 */
export function characterGeosets(look: CharacterLook): number[] {
  const facial = look.facial ?? [1, 1, 1];
  // group → variant (1 = the first); hair is a geoset id of its own
  const variants = new Map<number, number>([
    [1, facial[0]],
    [2, facial[2]],
    [3, facial[1]],
    [4, 1],
    [5, 1],
    [7, 2],
    [8, 1],
    [9, 1],
    [10, 1],
    [11, 1],
    [12, 1],
    [13, 1],
    [15, 1],
    [18, 1],
  ]);
  const items = look.items ?? {};
  const set = (group: number, variant: number) => variant && variants.set(group, variant + 1);
  set(4, items.gloves?.geosetGroups[0] ?? 0);
  set(5, items.boots?.geosetGroups[0] ?? 0);
  for (const torso of [items.shirt, items.chest]) {
    set(8, torso?.geosetGroups[0] ?? 0);
    set(10, torso?.geosetGroups[1] ?? 0);
  }
  set(9, items.legs?.geosetGroups[0] ?? 0);
  set(13, items.legs?.geosetGroups[2] ?? 0);
  set(13, items.chest?.geosetGroups[2] ?? 0);
  set(12, items.tabard ? Math.max(1, items.tabard.geosetGroups[0]) : 0);
  set(15, items.cape?.geosetGroups[0] ?? 0);
  set(18, items.belt?.geosetGroups[0] ?? 0);
  // what the helmet hides for this race
  const hidden = new Set<number>();
  const vis = items.head && look.helmetVis?.get(items.head.helmetVis[look.sex === 1 ? 1 : 0]);
  vis?.forEach((mask, i) => {
    if (i < HELMET_HIDES.length && (mask & (1 << (look.race - 1))) !== 0) {
      hidden.add(HELMET_HIDES[i]);
    }
  });
  const geosets = [0, 1];
  if (look.hair > 1 && !hidden.has(0)) {
    geosets.push(look.hair);
  }
  for (const [group, variant] of variants) {
    if (!hidden.has(group)) {
      geosets.push(group * 100 + variant);
    }
  }
  return geosets.sort((a, b) => a - b);
}

/** The models a character wears at its attachment points: its helmet (for its race and sex) and shoulders. */
export function characterAttachments(look: CharacterLook): ModelAttachment[] {
  const attachments: ModelAttachment[] = [];
  const texture = (folder: string, file: string) => (file ? `Item\\ObjectComponents\\${folder}\\${baseName(file)}.blp` : undefined);
  const head = look.items?.head;
  const prefix = RACE_PREFIX[look.race];
  if (head?.models[0] && prefix) {
    attachments.push({
      point: ATTACH_HEAD,
      model: `Item\\ObjectComponents\\Head\\${baseName(head.models[0])}_${prefix}${look.sex === 1 ? 'F' : 'M'}.m2`,
      texture: texture('Head', head.textures[0]),
    });
  }
  const shoulder = look.items?.shoulder;
  [ATTACH_SHOULDER_LEFT, ATTACH_SHOULDER_RIGHT].forEach((point, i) => {
    if (shoulder?.models[i]) {
      attachments.push({
        point,
        model: `Item\\ObjectComponents\\Shoulder\\${baseName(shoulder.models[i])}.m2`,
        texture: texture('Shoulder', shoulder.textures[i]),
      });
    }
  });
  return attachments;
}

/** A weapon or shield held in a hand (from its ItemDisplayInfo): its model at the hand's attachment point. */
export function weaponAttachment(display: ItemDisplay, hand: 'right' | 'left', shield = false): ModelAttachment | undefined {
  const folder = shield ? 'Shield' : 'Weapon';
  if (!display.models[0]) {
    return undefined;
  }
  return {
    point: shield ? ATTACH_SHIELD : hand === 'right' ? ATTACH_HAND_RIGHT : ATTACH_HAND_LEFT,
    model: `Item\\ObjectComponents\\${folder}\\${baseName(display.models[0])}.m2`,
    texture: display.textures[0] ? `Item\\ObjectComponents\\${folder}\\${baseName(display.textures[0])}.blp` : undefined,
  };
}

/** Item.dbc (0 ID, 5 DisplayInfoID, 6 InventoryType): the look of each item. */
export function parseItemDbc(dbc: DbcFile): Map<number, { displayId: number; inventoryType: number }> {
  const items = new Map<number, { displayId: number; inventoryType: number }>();
  for (let r = 0; r < dbc.recordCount; r++) {
    items.set(dbc.getUint(r, 0), { displayId: dbc.getUint(r, 5), inventoryType: dbc.getUint(r, 6) });
  }
  return items;
}
