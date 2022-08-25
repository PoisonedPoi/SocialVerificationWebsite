/*
This component shows the available microinteractions a user can use to build
their interaction. Each microinteraction can be dragged and dropped on the
canvas.
*/

import { Component, OnInit } from '@angular/core';
import { InteractionManagerService } from 'src/app/services/interaction-manager.service';

@Component({
  selector: 'app-microinteraction-selector',
  templateUrl: './microinteraction-selector.component.html',
  styleUrls: []
})
export class MicrointeractionSelectorComponent implements OnInit {

  constructor(private interactionManager: InteractionManagerService) { }

  ngOnInit(): void {
  }

  dragStart(type: string) {
    this.interactionManager.currentMicroType = type;
  }
}
