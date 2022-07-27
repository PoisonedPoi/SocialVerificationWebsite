import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import {MicroInteraction} from 'src/app/models/microInteraction';
import {ContextMenuService} from 'src/app/services/context-menu.service';
import { Position } from 'src/app/models/position';
import {CanvasManagerService} from 'src/app/services/canvas-manager.service';
import {ParameterManagerService} from 'src/app/services/parameter-manager.service';


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
    private canvasManager: CanvasManagerService,
    private parameterManager: ParameterManagerService
  ) { }

  ngOnInit(): void {
  }

  selectMicro(event: any) {
    event.preventDefault();

    this.parameterManager.getUpdatedMicro.emit(this.micro);
  }

  showContextMenu(event: any) {
    event.preventDefault();

    let xPos = this.el.nativeElement.getBoundingClientRect().x;
    let yPos = this.el.nativeElement.getBoundingClientRect().y;

    let canvasPos: Position = this.canvasManager.canvasOffset;

    let xOffset = xPos - canvasPos.x;
    let yOffset = yPos - canvasPos.y;

    this.contextMenu.displayContextMenu('micro', new Position(xOffset + event.offsetX, yOffset + event.offsetY), this.groupId, this.micro.id);
  }

}
