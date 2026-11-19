/* istanbul ignore file */
import { Service } from '@angular/core';
import * as childProcess from 'child_process';
// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame } from 'electron';
import * as fs from 'fs';

@Service()
export class ElectronService {
  ipcRenderer!: typeof ipcRenderer;
  webFrame!: typeof webFrame;
  childProcess!: typeof childProcess;
  fs!: typeof fs;

  constructor() {
    // Conditional imports
    if (this.isElectron()) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
    }
  }

  /** Opens a file in the program set for it on this computer (an error message when it can't, else ''). */
  openPath(path: string): Promise<string> {
    return window.require('electron').shell.openPath(path);
  }

  isElectron = () => {
    return window && window.process && window.process.type;
  };
}
