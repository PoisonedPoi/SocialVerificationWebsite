/*
This component displays the current interaction model on a canvas.
*/

import { Component, ComponentRef, ElementRef, HostListener, OnInit, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { Group } from 'src/app/models/group';
import { Interaction } from 'src/app/models/interaction';
import { Position } from 'src/app/models/position';
import { Transition } from 'src/app/models/transition';
import { InteractionManagerService } from 'src/app/services/interaction-manager.service';
import { ContextMenuService } from 'src/app/services/context-menu.service';
import { ContextMenuComponent } from './context-menu/context-menu.component';
import { GroupComponent } from './group/group.component';
import { TransitionComponent } from './transition/transition.component';

@Component({
  selector: 'app-interaction-canvas',
  templateUrl: './interaction-canvas.component.html',
  styles: []
})
export class InteractionCanvasComponent implements OnInit {

  position: Position = new Position();
  scrollPosition: Position = new Position();

  interaction: Interaction = new Interaction();

  contextMenuHidden: boolean = true;

  contextMenuComponent: ContextMenuComponent | null = null;

  @ViewChild("canvas", { read: ViewContainerRef})
  container!: ViewContainerRef;

  @ViewChild("canvasContainer") canvasContainer!: ElementRef;

  // Components contained in container
  components: ComponentRef<any>[] = [];

  // Load XML stored in local storage
  @HostListener('window:load', ['$event'])
  onLoadHander() {
    this.interactionManager.loadInteractionFromLocal();
  }

  // Save XML to local storage
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHander() {
    this.interactionManager.saveInteractionToLocal();
  }

  constructor(
    private interactionManager: InteractionManagerService,
    private contextMenu: ContextMenuService,
    private render: Renderer2,
    private el: ElementRef
  ) {
  }

  ngOnInit(): void {
    this.render.listen('window', 'load', () => {
      this.position = new Position(this.el.nativeElement.getBoundingClientRect().left, this.el.nativeElement.getBoundingClientRect().top);

      // Set canvas offset in canvasManager OnLoad
      // TODO Update canvas offsets when user changes the window size
      this.interactionManager.canvasOffset = this.position;
      this.interactionManager.canvasScrollOffset = this.scrollPosition;
    });

    // When interaction changes, re-render the canvas
    this.interactionManager.getUpdatedInteraction.subscribe((interaction) => {
      this.container.clear();
      this.interaction = interaction;
      this.renderCanvas();
    });

    // Show and hide context menu
    this.contextMenu.showContextMenu.subscribe(() => {
      this.showContextMenu();
    });

    this.contextMenu.hideContextMenuEmitter.subscribe(() => {
      this.hideContextMenu();
    });
  }

  /* CANVAS RENDERING */

  renderCanvas(): void {
    this.interaction.groups.forEach((g: Group) => {
      // Create a group component
      const groupComponent = this.container.createComponent(GroupComponent).instance;

      // Set the component to match the model
      groupComponent.setGroup(g);
    });

    this.interaction.transitions.forEach((t: Transition) => {
      // Create a transition component
      const transitionComponent = this.container.createComponent(TransitionComponent).instance;

      // Set the component to match the model
      transitionComponent.setTransition(t);
    });

    this.contextMenuComponent = this.container.createComponent(ContextMenuComponent).instance;
  }

  updateScrollOffset(event: any) {
    this.scrollPosition.x = event.target.scrollLeft;
    this.scrollPosition.y = event.target.scrollTop;
  }

  /* CANVAS INPUT */

  clickCanvas(event: any) {
    if (this.interactionManager.isAddingGroup) {
      // Add group model to current interaction
      this.interactionManager.addGroup(event.offsetX - this.scrollPosition.x, event.offsetY - this.scrollPosition.y);

      this.interactionManager.setAddingGroup(false);
    }
  }

  /* CONTEXT MENU */

  showContextMenu(): void {
    this.contextMenuHidden = false;

    if (this.contextMenuComponent) {
      this.contextMenuComponent.setMenu(this.contextMenu.type, this.contextMenu.position, this.contextMenu.groupId, this.contextMenu.microId, this.contextMenu.transitionId);
    } else {
      console.log("context menu comp doesn't exist");
    }
  }

  hideContextMenu(): void {
    this.contextMenuHidden = true;

    let c = ContextMenuComponent;

    const contextMenu = this.components.find((component: ComponentRef<any>) => component.instance instanceof c);
    if (contextMenu) {
      const componentIndex = this.components.indexOf(contextMenu);
      if (componentIndex !== -1) {
        // Remove component from both view and array
        if (this.container.indexOf(contextMenu.hostView) > -1) {
          this.container.remove(this.container.indexOf(contextMenu.hostView));
          this.components.splice(componentIndex, 1);
        }
      }
    }
  }

  allowDrop(event: any) {
    event.preventDefault();
  }

  addMicro(event: any) {
    let g: Group = this.interactionManager.addGroup(event.offsetX - this.scrollPosition.x, event.offsetY - this.scrollPosition.y);
    this.interactionManager.setAddingGroup(false);

    this.interactionManager.addMicroToGroup(g.id);
    this.interactionManager.updateGroup(g);
  }
}
