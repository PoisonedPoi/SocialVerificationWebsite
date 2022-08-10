import { CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { Group } from 'src/app/models/group';
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

  constructor(
    private canvasManager: CanvasManagerService, 
    private contextMenu: ContextMenuService,
  ) {}

  ngOnInit(): void {
  }

  ngViewAfterInit(): void {
    this.canvasManager.getUpdatedInteraction.subscribe((interaction) => {
      let g = interaction.getGroup(this.group.id);
      if (g) {
        this.group = g;
      }
    });
  }

  setGroup(g: Group) {
    this.group = g;
    this.x = this.group.x + 'px';
    this.y = this.group.y + 'px';
    this.group.name = g.name;
  }

  updateName(event: any) {
    this.group.name = event.target.value;
    this.canvasManager.updateGroup(this.group);
  }

  showContextMenu(event: any) {
    if (this.contextMenu.type != '') {
      return;
    }

    event.preventDefault();

    let xNum: number = parseInt(this.x.substring(0, this.x.length - 2));
    let yNum: number = parseInt(this.y.substring(0, this.x.length - 2));

    this.contextMenu.displayContextMenu('group', new Position(xNum + event.offsetX, yNum + event.offsetY), this.group.id);
  }

  allowDrop(event: any) {
    event.preventDefault();
  }

  droppedGroup(event: CdkDragEnd) {
    let rect = event.source.getRootElement().getBoundingClientRect();
    this.group.x = rect.x - this.canvasManager.canvasOffset.x + this.canvasManager.canvasScrollOffset.x;
    this.group.y = rect.y - this.canvasManager.canvasOffset.y + this.canvasManager.canvasScrollOffset.y;
    this.canvasManager.updateGroup(this.group);
  }

  dropMicro() {
    // Add micro to group
    //this.group.micros.push(new MicroInteraction(this.group.microIdCounter++, this.canvasManager.currentMicroType));
    this.canvasManager.addMicroToGroup(this.group.id);
    this.canvasManager.updateGroup(this.group);
  }

  addTransition() {
    if (this.canvasManager.addingTransition == 1) {
      this.canvasManager.setGroup1Id(this.group.id);
    } else if (this.canvasManager.addingTransition == 2) {
      this.canvasManager.setGroup2Id(this.group.id);
    }
  }
}
