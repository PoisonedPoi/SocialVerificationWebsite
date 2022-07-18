import { Component, HostListener, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Group } from 'src/app/models/group';
import { Interaction } from 'src/app/models/interaction';
import { CanvasManagerService } from 'src/app/services/canvas-manager.service';
import { GroupComponent } from './group/group.component';

@Component({
  selector: 'app-interaction-canvas',
  templateUrl: './interaction-canvas.component.html',
  styles: [
  ]
})
export class InteractionCanvasComponent implements OnInit {

  interaction: Interaction = new Interaction();
  groups: Group[] = [];

  @ViewChild("canvas", { read: ViewContainerRef})
  container!: ViewContainerRef;
  
  // Load XML stored in local storage
  @HostListener('window:load', ['$event'])
  onLoadHander() {
    this.canvasManager.loadInteractionFromLocal();
  }

  // Save XML to local storage 
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHander() {
    this.canvasManager.saveInteractionToLocal();
  }

  constructor(private canvasManager: CanvasManagerService) {
  }

  ngOnInit(): void {
    this.canvasManager.getUpdatedGroups.subscribe((groups) => {
      this.groups = groups;
    });

    this.canvasManager.getUpdatedInteraction.subscribe((interaction) => {
      this.interaction = interaction;
    })
  }

  clickCanvas(event: any) {
    if (this.canvasManager.isAddingGroup) {
      console.log('Add group here (%d,%d)', event.offsetX, event.offsetY);

      // Create empty group and push onto interaction
      let group = this.interaction.createGroup();

      // Setup group given 
      this.interaction.makeGroup(event.offsetX, event.offsetY, group.id, group.isInitialGroup, group.name);

      const groupComponent = this.container.createComponent(GroupComponent).instance;

      groupComponent.setGroupById(group.id);

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
