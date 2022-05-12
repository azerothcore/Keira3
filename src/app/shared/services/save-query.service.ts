import { Injectable } from '@angular/core';
import * as fs from 'fs';

@Injectable({
  providedIn: 'root',
})
export class SaveQueryService {
  filePath: string = '';

  appendToFile(query: string) {
    fs.appendFile(this.filePath, query + '\n', { flag: 'a+' }, (err) => {
      if (err) console.log(err);
    });
  }

  setFilePath(path: string) {
    this.filePath = path;
  }
}
