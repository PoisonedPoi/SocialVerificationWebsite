import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Group } from 'src/app/models/group';
import { CanvasManagerService } from 'src/app/services/canvas-manager.service';
import { GroupComponent } from './group/group.component';

@Component({
  selector: 'app-interaction-canvas',
  templateUrl: './interaction-canvas.component.html',
  styleUrls: ['./interaction-canvas.component.css']
})
export class InteractionCanvasComponent implements OnInit {

  groups: Group[] = [];

  @ViewChild("canvas", { read: ViewContainerRef})
  container!: ViewContainerRef;

  constructor(private canvasManager: CanvasManagerService) {
  }

  ngOnInit(): void {
    this.canvasManager.getUpdatedGroups.subscribe((groups) => {
      this.groups = groups;
    })
  }

  clickCanvas(event: any) {
    if (this.canvasManager.isAddingGroup) {
      console.log('Add group here (%d,%d)', event.offsetX, event.offsetY);

      let id = this.canvasManager.addGroup(event.offsetX, event.offsetY)

      const group = this.container.createComponent(GroupComponent).instance;

      group.setGroupById(id);

      this.canvasManager.setAddingGroup(false);
    } else if (this.canvasManager.addingTransition == 1) {
      console.log('Init transition here (%d,%d)', event.offsetX, event.offsetY);

      this.canvasManager.setAddingTransition(2);
    }  else if (this.canvasManager.addingTransition == 2) {
      console.log('Final transition here (%d,%d)', event.offsetX, event.offsetY);

      this.canvasManager.setAddingTransition(0);
    }
  }

}
