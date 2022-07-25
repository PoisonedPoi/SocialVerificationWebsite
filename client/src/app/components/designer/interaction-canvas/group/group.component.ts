import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild, ViewContainerRef, ComponentRef } from '@angular/core';
import { Group } from 'src/app/models/group';
import {MicroInteraction} from 'src/app/models/microInteraction';
import { Position } from 'src/app/models/position';
import { CanvasManagerService } from 'src/app/services/canvas-manager.service';
import { ContextMenuService } from 'src/app/services/context-menu.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styles: []
})

export class GroupComponent implements OnInit {

  x: string = "";
  y: string = "";

  group: Group = new Group();
  name: string = "";

  @ViewChild("microContainer", { read: ViewContainerRef})
  microContainer!: ViewContainerRef;

  // Components contained in container
  microComponents: ComponentRef<any>[] = [];

  constructor(
    private canvasManager: CanvasManagerService, 
    private contextMenu: ContextMenuService,
  ) {
    this.canvasManager.getUpdatedInteraction.subscribe((interaction) => {
      let g = interaction.getGroup(this.group.id);
      if (g) {
        this.group = g;
        this.renderMicros();
      }
    });
  }

  ngOnInit(): void {

  }

  setGroup(g: Group) {
    this.group = g;
    this.x = this.group.x + 'px';
    this.y = this.group.y + 'px';
    this.group.name = g.name;
  }

  updateName(event: any) {
    this.name = event.target.value;
    this.group.name = this.name;
    this.canvasManager.updateGroup(this.group);
  }

  showContextMenu(event: any) {
    event.preventDefault();

    let xNum: number = parseInt(this.x.substring(0, this.x.length - 2));
    let yNum: number = parseInt(this.y.substring(0, this.x.length - 2));

    this.contextMenu.displayContextMenu(this.group.id, 'group', new Position(xNum + event.offsetX, yNum + event.offsetY));
  }

  renderMicros() {
    this.group.micros.forEach((m: MicroInteraction) => {
      const microComponent = this.microContainer.createComponent(/*MicroComponent*/GroupComponent);
      microComponent.setMicro(m);
    });
  }

  allowDrop(event: any) {
    event.preventDefault();
  }

  droppedGroup(event: CdkDragEnd) {
    let rect = event.source.getRootElement().getBoundingClientRect();
    this.group.x = rect.x - this.canvasManager.canvasOffsetX;
    this.group.y = rect.y - this.canvasManager.canvasOffsetY;
    this.canvasManager.updateGroup(this.group);
  }

  dropMicro(event: any) {
    let microData = JSON.parse(event.dataTransfer.getData("microData"));

    // Add micro to group
    

    console.log(event);
  }
}
