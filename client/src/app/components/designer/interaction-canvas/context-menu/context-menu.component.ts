/*
This component is generated when the user right-clicks
on another component. It displays actions that are possible
to apply to the component that was clicked on.
*/

import { Component, OnInit, Input, ElementRef, HostListener } from '@angular/core';
import { Position } from 'src/app/models/position';
import { InteractionManagerService } from 'src/app/services/interaction-manager.service';
import { ContextMenuService } from 'src/app/services/context-menu.service';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styles: [
  ]
})
export class ContextMenuComponent implements OnInit {

  @Input() type: string = 'group';
  @Input() groupId: number = -1;
  @Input() microId: number = -1;
  @Input() transitionId: number = -1;

  @Input() position: Position = new Position();

  x: string = '';
  y: string = '';

  menuHidden: boolean = true;

  removeGroupHidden: boolean = true;
  removeTransitionHidden: boolean = true;
  removeMicroHidden: boolean = true;

  @HostListener('document:click', ['$event'])
  clickOff(event: any) {
    if(!this.el.nativeElement.contains(event.target)) {
      this.menuHidden = true;
      this.contextMenu.type = '';
      this.contextMenu.hideContextMenuEmitter.emit();
    }
  }

  constructor(
    private interactionManager: InteractionManagerService,
    private contextMenu: ContextMenuService,
    private el: ElementRef
  ) { }

  ngOnInit(): void {
  }

  setMenu(type: string, position: Position, groupId: number = -1, microId: number = -1, transitionId: number = -1): void {
    this.menuHidden = false;

    this.type = type;
    this.position = position;

    this.groupId = groupId;
    this.microId = microId;
    this.transitionId = transitionId;

    this.x = position.x + 'px';
    this.y = position.y + 'px';
  }

  removeGroup() {
    this.interactionManager.removeGroup(this.groupId);
  }

  removeTransition() {
    this.interactionManager.removeTransition(this.transitionId);
  }

  removeMicro() {
    this.interactionManager.removeMicro(this.groupId, this.microId);
  }

}
