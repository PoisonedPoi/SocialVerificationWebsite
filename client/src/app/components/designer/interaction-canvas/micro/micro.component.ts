/*
This component is placed on a group to add
meaning to a group. It is actions that are performed by
the robot when the group is executed.
*/

import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { MicroInteraction } from 'src/app/models/microInteraction';
import { ContextMenuService } from 'src/app/services/context-menu.service';
import { Position } from 'src/app/models/position';
import { ParameterManagerService } from 'src/app/services/parameter-manager.service';
import { CanvasManagerService } from 'src/app/services/canvas-manager.service';
import { InteractionManagerService } from 'src/app/services/interaction-manager.service';
import { CdkDragEnd } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-micro',
  templateUrl: './micro.component.html',
  styles: [
  ]
})
export class MicroComponent implements OnInit {

  micro: MicroInteraction = new MicroInteraction(1, 0, 0, 'Greeter');

  @ViewChild('microEl') el!: ElementRef;

  tempAddTrans: boolean = false;
  x: string = '';
  y: string = '';

  constructor(
    private contextMenu: ContextMenuService,
    private canvasManager: CanvasManagerService,
    private interactionManager: InteractionManagerService,
    private parameterManager: ParameterManagerService
  ) { }

  ngOnInit(): void {
  }

  setMicro(m: MicroInteraction) {
    this.x = m.x + 'px';
    this.y = m.y + 'px';
    this.micro = m;
  }

  /* Show microinteraction's parameter options in the interaction options pane */
  clickMicro(event: any) {
    event.preventDefault();
    
    if (this.tempAddTrans) {
      if (this.interactionManager.addingTransition == 1) {
        this.interactionManager.setFirstMicroId(this.micro.id);
      } else if (this.interactionManager.addingTransition == 2) {
        this.interactionManager.setSecondMicroId(this.micro.id);
      }
    } else {
      this.parameterManager.updateCurrentMicro(this.micro);
    }
  }

  /* Show options menu when right-clicked */
  showContextMenu(event: any) {
    event.preventDefault();

    let xPos = this.el.nativeElement.getBoundingClientRect().x;
    let yPos = this.el.nativeElement.getBoundingClientRect().y;

    let canvasPos: Position = this.canvasManager.canvasOffset;

    let xOffset = xPos - canvasPos.x;
    let yOffset = yPos - canvasPos.y;

    this.contextMenu.displayContextMenu('micro', new Position(xOffset + event.offsetX, yOffset + event.offsetY), this.micro.id);
  }

  droppedMicro(event: CdkDragEnd) {
    let rect = event.source.getRootElement().getBoundingClientRect();
    this.micro.x = rect.x - this.canvasManager.canvasOffset.x + this.canvasManager.canvasScrollOffset.x;
    this.micro.y = rect.y - this.canvasManager.canvasOffset.y + this.canvasManager.canvasScrollOffset.y;
    this.interactionManager.updateMicro(this.micro);
  }

}
