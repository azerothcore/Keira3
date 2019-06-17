import { Component, OnInit } from '@angular/core';
import { QueryService } from '../../../services/query.service';
import { VersionDbRow, VersionRow } from '../../../types/general';
import { version } from '../../../../../package.json';

@Component({
  selector: 'app-home',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  coreVersions: VersionRow;
  dbWorldVersion: string;
  public readonly KEIRA_VERSION = version;

  constructor(
    private queryService: QueryService,
  ) { }

  ngOnInit() {
    this.getCoreVersion();
    this.getWorldDbVersion();
  }

  private getCoreVersion(): void {
    const query = 'SELECT * FROM version';
    this.queryService.query<VersionRow>(query).subscribe((data) => {
      if (data && data.results && data.results.length > 0) {
        this.coreVersions = data.results[0];
      } else {
        console.error(`Query ${query} produced no results: ${data}`);
      }
    }, (error) => {
      console.error(error);
    });
  }

  private getWorldDbVersion() {
    const query = 'SELECT * FROM version_db_world';
    this.queryService.query<VersionDbRow>(query).subscribe((data) => {
      if (data && data.results && data.results.length > 0) {
        const keys = Object.keys(data.results[0]);
        this.dbWorldVersion = keys[2];
      } else {
        console.error(`Query ${query} produced no results: ${data}`);
      }
    }, (error) => {
      console.error(error);
    });
  }

  getCommit(hash: string) {
    return `https://github.com/azerothcore/azerothcore-wotlk/commit/${hash}`;
  }
}
