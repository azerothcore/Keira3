import { Injectable } from '@angular/core';
import * as sqlite from 'sqlite3';
import { AppConfig } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  constructor() {
    const myDb = new sqlite.Database(AppConfig.sqlitePath, sqlite.OPEN_READONLY, (error) => {
      console.error(error);
    });

    // myDb.get('SELECT * FROM achievements WHERE id = 42', (error, result) => {
    //   console.log(error);
    //   console.log(result);
    // });
  }
}
