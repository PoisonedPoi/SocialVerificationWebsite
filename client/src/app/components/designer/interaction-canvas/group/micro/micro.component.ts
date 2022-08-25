/*
This component is placed on a group to add
meaning to a group. It is actions that are performed by
the robot when the group is executed.
*/

import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { MicroInteraction } from 'src/app/models/microInteraction';
import { ContextMenuService } from 'src/app/services/context-menu.service';
import { Position } from 'src/app/models/position';
import { InteractionManagerService } from 'src/app/services/interaction-manager.service';
import { ParameterManagerService } from 'src/app/services/parameter-manager.service';

@Component({
  selector: 'app-micro',
  templateUrl: './micro.component.html',
  styles: [
  ]
})
export class MicroComponent implements OnInit {

  @Input() micro: MicroInteraction = new MicroInteraction(1, 1, 'Greeter');
  @Input() groupId: number = -1;

  @ViewChild('microEl') el!: ElementRef;

  constructor(
    private contextMenu: ContextMenuService,
    private interactionManager: InteractionManagerService,
    private parameterManager: ParameterManagerService
  ) { }

  ngOnInit(): void {
  }

  /* Show microinteraction's parameter options in the interaction options pane */
  selectMicro(event: any) {
    event.preventDefault();

    this.parameterManager.updateCurrentMicro(this.micro);
  }

  /* Show options menu when right-clicked */
  showContextMenu(event: any) {
    event.preventDefault();

    let xPos = this.el.nativeElement.getBoundingClientRect().x;
    let yPos = this.el.nativeElement.getBoundingClientRect().y;

    let canvasPos: Position = this.interactionManager.canvasOffset;

    let xOffset = xPos - canvasPos.x;
    let yOffset = yPos - canvasPos.y;

    this.contextMenu.displayContextMenu('micro', new Position(xOffset + event.offsetX, yOffset + event.offsetY), this.groupId, this.micro.id);
  }

}
