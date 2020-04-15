import { Component, OnInit } from '@angular/core';
import { QuestPreviewService } from './quest-preview.service';

@Component({
  selector: 'keira-quest-preview',
  templateUrl: './quest-preview.component.html',
  styleUrls: ['./quest-preview.component.scss']
})
export class QuestPreviewComponent implements OnInit {
  constructor(public readonly service: QuestPreviewService) { }

  get showMaxLevel(): boolean { return !!this.service.maxlevel && this.service.maxlevel !== '0'; }
  get showRaces(): boolean { return !this.service.side && this.service.races && this.service.races.length > 0; }
  get showClasses(): boolean { return !!this.service.classes && this.service.classes.length > 0; }

  ngOnInit() {
    this.service.initializeServices();
  }
}
