import { Component, OnInit } from '@angular/core';
import {CanvasManagerService} from 'src/app/services/canvas-manager.service';

@Component({
  selector: 'app-microinteraction-selector',
  templateUrl: './microinteraction-selector.component.html',
  styleUrls: []
})
export class MicrointeractionSelectorComponent implements OnInit {

  constructor(private canvasManager: CanvasManagerService) { }

  ngOnInit(): void {
  }

  dragStart(type: string) {
    this.canvasManager.currentMicroType = type;
  }
}
