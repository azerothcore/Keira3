/* istanbul ignore file */

import { AppConfig } from '../../../environments/environment';
import {
  CHARACTER_PART,
  CONTENT_WOTLK,
  // DisplayInfo,
  GENDER,
  Gender,
  NOT_DISPLAYED_SLOTS,
  RACES,
  // wotlkToShadowlandSlots,
  WoWModel,
} from './model-3d-viewer.model';

declare const ZamModelViewer: any;

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

async function findRaceGenderOptions(race: number, gender: Gender): Promise<any> {
  const options = await fetch(`${CONTENT_WOTLK}meta/charactercustomization2/${race}_${gender}.json`).then((response) => response.json());
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
 *
 * @param model: {{}|{{id, type}}}
 * @returns {Promise<{models: {id: string, type: number}, charCustomization: {options: []}, items: (*|*[])}|{models: {id, type}}>}
 */
async function optionsFromModel(model: WoWModel): Promise<{ models: WoWModel; charCustomization?: { options: any[] }; items?: any }> {
  if (model.id && model.type) {
    // NPC or item
    const { id, type } = model;
    return { models: { id, type } };
  }

  const { race, gender } = model;

  // CHARACTER OPTIONS
  // This is how we describe a character properties
  const fullOptions = await findRaceGenderOptions(race, gender);

  // slot ids on model viewer
  const characterItems = model.items ? model.items.filter((e) => !NOT_DISPLAYED_SLOTS.includes(e[0])) : [];
  const options = getOptions(model, fullOptions);

  const retGender = gender === 1 ? GENDER.FEMALE : GENDER.MALE;
  const raceToModelId = RACES[race] + retGender;

  return {
    items: characterItems,
    charCustomization: {
      options: options,
    },
    models: {
      id: raceToModelId,
      type: 16,
    },
  };
}

/**
 *
 * @param character
 * @param {{}}fullOptions: Zaming API character options payload
 * @return {[]}
 */
function getOptions(character: {}, fullOptions): any[] {
  const options = fullOptions.Options;
  const ret = [];
  for (const prop in CHARACTER_PART) {
    const part = options.find((e) => e.Name === prop);

    if (!part) {
      continue;
    }

    const newOption = {
      optionId: part.Id,
      choiceId: CHARACTER_PART[prop] ? part.Choices[character[CHARACTER_PART[prop]]]?.id : part.Choices[0].Id,
    };
    ret.push(newOption);
  }

  return ret;
}

/**
 *
 * @param {number} aspect: Size of the character
 * @param {string} containerSelector: jQuery selector on the container
 * @param {WoWModel} model: A json representation of a character
 * @returns {Promise<WowModelViewer>}
 */
export async function generateModels(
  aspect: number,
  containerSelector: string,
  model: WoWModel,
  contentPath = CONTENT_WOTLK,
): Promise<any> {
  const modelOptions = await optionsFromModel(model);
  const models = {
    type: 2,
    contentPath,
    container: jQuery(containerSelector),
    aspect: aspect,
    hd: false,
    ...modelOptions,
  };
  window['models'] = models;

  if (typeof ZamModelViewer !== 'undefined') {
    return new ZamModelViewer(models);
  }
}

export function getShadowlandDisplayId(wotlkDisplayId: number): Promise<{ displayId: number; displayType: number }> {
  return new Promise(function (resolve, reject) {
    const sqlite = window.require('sqlite3');
    const db = new sqlite.Database(AppConfig.sqliteItem3dPath, sqlite.OPEN_READONLY, (error) => {
      if (error) {
        console.log(`Error when opening sqlite database at DISPLAY ID`);
        console.error(error);
      }
    });

    if (db) {
      return db.all(
        `SELECT ItemDisplayInfoID, DisplayType FROM item_appearance WHERE ID = (SELECT ItemAppearanceID FROM item_modified_appearance WHERE ItemID = ${wotlkDisplayId})`,
        function (err, data) {
          if (err) {
            reject(err);
          } else {
            if (data.length && 'ItemDisplayInfoID' in data[0]) {
              resolve({ displayId: data[0].ItemDisplayInfoID, displayType: data[0].DisplayType });
            } else {
              console.log('no ItemDisplayInfoID available for this item');
            }
          }
        },
      );
      /* istanbul ignore else */
    } /* istanbul ignore next */ else if (this.electronService.isElectron()) {
      console.error(`sqite db was not defined when trying to get the shadow lands display id`);
    }
  });
}
