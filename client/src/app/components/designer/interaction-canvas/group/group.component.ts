import { Component, OnInit } from '@angular/core';
import { Group } from 'src/app/models/group';
import { CanvasManagerService } from 'src/app/services/canvas-manager.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {

  group: Group = new Group();
  x: string = "";
  y: string = "";

  constructor(private canvasManager: CanvasManagerService) {

  }

  ngOnInit(): void {

  }

  setGroupById(id: number) {
    this.group = this.canvasManager.getGroupById(id);
    console.log(this.group);
    this.x = this.group.x + 'px';
    this.y = this.group.y + 'px';
  }

}
