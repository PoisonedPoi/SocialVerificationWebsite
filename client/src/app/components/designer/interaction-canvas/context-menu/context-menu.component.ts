import { Component, OnInit, Input, ElementRef, HostListener } from '@angular/core';
import {Position} from 'src/app/models/position';
import {CanvasManagerService} from 'src/app/services/canvas-manager.service';
import {ContextMenuService} from 'src/app/services/context-menu.service';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styles: [
  ]
})
export class ContextMenuComponent implements OnInit {

  @Input() type: string = 'group';
  @Input() id: number = -1;
  @Input() position: Position = new Position();
  x: string = '';
  y: string = '';

  menuHidden: boolean = true;

  removeGroupHidden: boolean = true;

  @HostListener('document:click', ['$event'])
  clickOff(event: any) {
    if(!this.el.nativeElement.contains(event.target)) {
      this.menuHidden = true;
      this.contextMenu.hideContextMenuEmitter.emit();
    }  
  } 

  constructor(
    private canvasManager: CanvasManagerService,
    private contextMenu: ContextMenuService,
    private el: ElementRef
  ) { }

  ngOnInit(): void {
  }

  setMenu(id: number, type: string, position: Position): void {
    this.menuHidden = false;

    this.type = type;
    this.id = id;
    this.position = position;

    this.x = position.x + 'px';
    this.y = position.y + 'px';

    console.log("Menu: (%d, %d)", position.x, position.y);

    if (this.type == 'group') {
      this.removeGroupHidden = false;
    } else if (this.type == 'transition') {

    }
  }

  removeGroup() {
    this.canvasManager.removeGroup(this.id);
  }

}
