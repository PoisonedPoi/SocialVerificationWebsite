import { Component, OnInit } from '@angular/core';
import { Group } from 'src/app/models/group';
import { CanvasManagerService } from 'src/app/services/canvas-manager.service';

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
    this.canvasManager.updateGroup(this.group);
  }

  showContextMenu(event: any) {
    event.preventDefault();
    if (document.getElementById("contextMenuGroup").style.display == "block") {
        hideMenu();
    } else {
        var menu = document.getElementById("contextMenuGroup");
        document.getElementById("removeGroupBtn").setAttribute('value', e.target.id);
        menu.style.display = 'block';
        menu.style.left = e.pageX + "px";
        menu.style.top = e.pageY + "px";
    }
  }

}
