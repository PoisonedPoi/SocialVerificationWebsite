import { Component, OnInit } from '@angular/core';
import { Group } from 'src/app/models/group';
import { CanvasManagerService } from 'src/app/services/canvas-manager.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styles: [
  ]
})
export class GroupComponent implements OnInit {

  group: Group = new Group();
  x: string = "";
  y: string = "";
  name: string = "";

  constructor(private canvasManager: CanvasManagerService) {
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
    this.canvasManager.setGroup(this.group);
  }

}
