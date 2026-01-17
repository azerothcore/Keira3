import { Injectable } from '@angular/core';
import { findRaceGenderOptions, optionsFromModel } from './helper';
import { CharacterOptions, CONTENT_WOTLK, WoWModel } from './model-3d-viewer.model';

declare const ZamModelViewer: any;

@Injectable({
  providedIn: 'root',
})
export class Model3DViewerService {
  /**
   *
   * @param {number} aspect: Size of the character
   * @param {string} containerSelector: jQuery selector on the container
   * @param {WoWModel|CharacterOptions} model: A json representation of a character
   * @returns {Promise<WowModelViewer>}
   */
  /* istanbul ignore next */
  async generateModels(
    aspect: number,
    containerSelector: string,
    model: WoWModel | CharacterOptions,
    contentPath = CONTENT_WOTLK,
  ): Promise<typeof ZamModelViewer | undefined> {
    let modelOptions;
    let fullOptions;

    if ('id' in model && 'type' in model) {
      // NPC or item
      const { id, type } = model as WoWModel;
      modelOptions = { models: { id, type } };
    } else {
      const { race, gender } = model;

      fullOptions = await findRaceGenderOptions(race, gender);
      modelOptions = optionsFromModel(model, fullOptions);
    }

    const models = {
      type: 2,
      contentPath,
      container: jQuery(containerSelector),
      aspect,
      hd: false,
      ...modelOptions,
    };

    (window as any)['models'] = models;

    if (typeof ZamModelViewer !== 'undefined') {
      return new ZamModelViewer(models);
    }
  }
}
