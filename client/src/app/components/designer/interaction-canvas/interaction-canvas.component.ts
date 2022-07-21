import { Component, ComponentRef, ElementRef, HostListener, OnInit, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { Group } from 'src/app/models/group';
import { Interaction } from 'src/app/models/interaction';
import {Position} from 'src/app/models/position';
import { CanvasManagerService } from 'src/app/services/canvas-manager.service';
import {ContextMenuService} from 'src/app/services/context-menu.service';
import {ContextMenuComponent} from './context-menu/context-menu.component';
import { GroupComponent } from './group/group.component';

@Component({
  selector: 'app-interaction-canvas',
  templateUrl: './interaction-canvas.component.html',
  styles: []
})
export class InteractionCanvasComponent implements OnInit {

  offsetX: number = 5;
  offsetY: number = 5;

  position: Position = new Position();

  interaction: Interaction = new Interaction();
  groups: Group[] = [];

  @ViewChild("canvas", { read: ViewContainerRef})
  container!: ViewContainerRef;

  // Components contained in container
  components: ComponentRef<any>[] = [];

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

  constructor(
    private canvasManager: CanvasManagerService,
    private contextMenu: ContextMenuService,
    private render: Renderer2,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.render.listen('window', 'load', () => {
      this.position = new Position(this.el.nativeElement.getBoundingClientRect().left, this.el.nativeElement.getBoundingClientRect().top);

      this.canvasManager.setCanvasOffset(this.position.x, this.position.y);

      console.log(this.position);
    });

    this.canvasManager.getUpdatedInteraction.subscribe((interaction) => {
      this.container.clear();
      this.interaction = interaction;
      this.renderCanvas();
    });

    this.contextMenu.showContextMenu.subscribe(() => {
      this.showContextMenu();
    });

    this.contextMenu.hideContextMenuEmitter.subscribe(() => {
      this.hideContextMenu();
    });
  }

  renderCanvas(): void {
    this.interaction.groups.forEach((g: Group) => {
      // Create a group component
      const groupComponent = this.container.createComponent(GroupComponent).instance;

      // Set the component to match the model
      groupComponent.setGroup(g);
    });
  }

  clickCanvas(event: any) {
    if (this.canvasManager.isAddingGroup) {

      console.log('Add group here (%d,%d)', event.offsetX, event.offsetY);

      // Add group model to current state
      let group: Group = this.canvasManager.addGroup(event.offsetX, event.offsetY);

      // Create a group component
      const groupComponent = this.container.createComponent(GroupComponent).instance;

      // Set the component to match the model
      groupComponent.setGroup(group);

      this.canvasManager.setAddingGroup(false);

    } else if (this.canvasManager.addingTransition == 1) {
      console.log('Init transition here (%d,%d)', event.offsetX, event.offsetY);

      this.canvasManager.setAddingTransition(2);
    }  else if (this.canvasManager.addingTransition == 2) {
      console.log('Final transition here (%d,%d)', event.offsetX, event.offsetY);

      this.canvasManager.setAddingTransition(0);
    }
  }

  showContextMenu(): void {
    const contextMenuComponent = this.container.createComponent(ContextMenuComponent);

    this.components.push(contextMenuComponent);

    contextMenuComponent.instance.setMenu(this.contextMenu.id, this.contextMenu.type, this.contextMenu.position);
  }

  hideContextMenu(): void {
    let c = ContextMenuComponent;
  
    /*
    const contextMenu = this.components.find((component: ComponentRef<any>) => component.instance instanceof c);
    if (contextMenu) {
      const componentIndex = this.components.indexOf(contextMenu);
      if (componentIndex !== -1) {
        // Remove component from both view and array
        this.container.remove(this.container.indexOf(contextMenu.hostView));
        this.components.splice(componentIndex, 1);
      }
    }
    */
  }

}
