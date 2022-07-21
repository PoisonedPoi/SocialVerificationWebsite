import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { Group } from 'src/app/models/group';
import { Position } from 'src/app/models/position';
import { CanvasManagerService } from 'src/app/services/canvas-manager.service';
import {ContextMenuService} from 'src/app/services/context-menu.service';

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

  constructor(
    private canvasManager: CanvasManagerService, 
    private contextMenu: ContextMenuService,
  ) {
    this.canvasManager.getUpdatedInteraction.subscribe((interaction) => {
      let g = interaction.getGroup(this.group.id);
      if (g) { this.group = g; }
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

}
