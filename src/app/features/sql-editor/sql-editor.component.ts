import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'keira-sql-editor',
  templateUrl: './sql-editor.component.html',
  styleUrls: ['./sql-editor.component.scss']
})
export class SqlEditorComponent implements OnInit {

  code = 'SELECT * FROM `creature_template` ORDER BY `entry` ASC LIMIT 100';

  constructor() { }

  ngOnInit(): void {
  }

}
