/* istanbul ignore file */

import { CHARACTER_PART, CharacterOptions, CONTENT_WOTLK, Gender, MODEL_TYPE, NOT_DISPLAYED_SLOTS, SLOTS } from './model-3d-viewer.model';

/**
 * Returns a 2 dimensional list the inner list contains on first position the item slot, the second the item
 * display-id ex: [[1,1170],[3,4925]]
 * @param {*[{item: {entry: number, displayid: number}, transmog: {entry: number, displayid: number}, slot: number}]} equipments
 * @returns {Promise<int[]>}
 */
// async function findItemsInEquipments(equipments: any[]): Promise<number[][]> {
//   for (const equipment of equipments) {
//     if (NOT_DISPLAYED_SLOTS.includes(equipment.slot)) {
//       continue;
//     }

//     const displayedItem = Object.keys(equipment.transmog).length !== 0 ? equipment.transmog : equipment.item;
//     const displaySlot = await getDisplaySlot(displayedItem.entry, equipment.slot, displayedItem.displayid);
//     equipment.displaySlot = displaySlot.displaySlot;
//     equipment.displayId = displaySlot.displayId;
//     Object.assign(displaySlot, equipment);
//   }
//   return equipments.filter((e: any) => e.displaySlot).map((e: any) => [e.displaySlot, e.displayId]);
// }

export async function findRaceGenderOptions(race: number, gender: Gender): Promise<any> {
  const raceGender = race * 2 - 1 + gender;
  const options = await fetch(`${CONTENT_WOTLK}meta/charactercustomization/${raceGender}.json`).then((response) => response.json());
  if (options.data) {
    return options.data;
  }

  return options;
}

// async function getDisplaySlot(item: number, slot: number, displayId: number): Promise<DisplayInfo> {
//   const displayInfo: DisplayInfo = {
//     displaySlot: slot,
//     displayId: displayId,
//   };

//   try {
//     await fetch(`${CONTENT_WOTLK}meta/armor/${slot}/${displayId}.json`).then((response) => response.json());

//     return displayInfo;
//   } catch (e) {
//     const resp = await fetch(`https://wotlk.murlocvillage.com/api/items/${item}/${displayId}`).then((response) => response.json());
//     const res = resp.data ? resp.data : resp;

//     if (res.newDisplayId !== displayId) {
//       displayInfo.displayId = res.newDisplayId;
//       return displayInfo;
//     }
//   }

//   const retSlot = wotlkToShadowlandSlots[slot];
//   if (!retSlot) {
//     console.warn(`Item: ${item} display: ${displayId} or slot: ${slot} not found for `);
//   } else {
//     displayInfo.displaySlot = retSlot;
//   }

//   return displayInfo;
// }

/**
 * This function return the design choices for a character this does not work for NPC / Creature / Items
 * @param {Object} model - The model object to generate options from.
 * @param {{}} fullOptions - The type of the model.
 * @returns {{models: {id: string, type: number}, charCustomization: {options: []}, items: (*|*[])}|{models: {id, type}}
 */
export function optionsFromModel(model: CharacterOptions & { noCharCustomization?: boolean }, fullOptions: any) {
  const { race, gender } = model;

  // slot ids on model viewer
  const characterItems = model.items ? model.items.filter((e) => !NOT_DISPLAYED_SLOTS.includes(e[0] as unknown as SLOTS)) : [];
  const ret: { items: any[]; models: { id: number; type: number }; charCustomization?: { options: any[] } } = {
    items: characterItems,
    models: {
      id: race * 2 - 1 + gender,
      type: MODEL_TYPE.CHARACTER,
    },
  };

  const options = getCharacterOptions(model, fullOptions);
  const charCustomization = { options };
  if (!model.noCharCustomization) {
    ret.charCustomization = charCustomization;
  }

  return ret;
}

function getCharacterOptions(
  character: CharacterOptions,
  fullOptions: { Options: { Name: string; Id: string; Choices: { id: string; Id?: string }[] }[] },
) {
  const options = fullOptions.Options;
  const missingChoice = [];
  const ret = [];
  for (const prop in CHARACTER_PART) {
    const part = options.find((e) => e.Name === prop);

    if (!part) {
      continue;
    }

    const charPart = CHARACTER_PART[prop];
    const choice = charPart && character[charPart];
    const choiceId = typeof choice === 'number' ? part.Choices[choice]?.Id : part.Choices[0].Id;

    const newOption = {
      optionId: part.Id,
      choiceId,
    };

    if (newOption.choiceId === undefined) {
      missingChoice.push(CHARACTER_PART[prop]);
    }

    ret.push(newOption);
  }
  console.warn(`In character: `, character, `the following options are missing`, missingChoice);

  return ret;
}

export function getShadowlandDisplayId(
  sqliteItem3dPath: string,
  wotlkDisplayId: number,
): Promise<{ displayId: number; displayType: number }> {
  return new Promise(function (resolve, reject) {
    const sqlite = window.require('sqlite3');
    const db = new sqlite.Database(sqliteItem3dPath, sqlite.OPEN_READONLY, (error: unknown) => {
      if (error) {
        // eslint-disable-next-line no-console
        console.log(`Error when opening sqlite database at DISPLAY ID`);
        console.error(error);
      }
    });

    if (db) {
      return db.all(
        `SELECT ItemDisplayInfoID, DisplayType FROM item_appearance WHERE ID = (SELECT ItemAppearanceID FROM item_modified_appearance WHERE ItemID = ${wotlkDisplayId})`,
        function (err: unknown, data: { ItemDisplayInfoID: number; DisplayType: number }[]) {
          if (err) {
            reject(err);
          } else {
            if (data.length && 'ItemDisplayInfoID' in data[0]) {
              resolve({ displayId: data[0].ItemDisplayInfoID, displayType: data[0].DisplayType });
            } else {
              // eslint-disable-next-line no-console
              console.log('no ItemDisplayInfoID available for this item');
            }
          }
        },
      );
      /* istanbul ignore else */
    }
    // /* istanbul ignore next */ else if (this.electronService.isElectron()) {
    //   console.error(`sqite db was not defined when trying to get the shadow lands display id`);
    // }
  });
}
