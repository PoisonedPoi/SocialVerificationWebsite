import { Component, OnInit, Input } from '@angular/core';
import {Position} from 'src/app/models/position';
import {CanvasManagerService} from 'src/app/services/canvas-manager.service';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styles: [
  ]
})
export class ContextMenuComponent implements OnInit {

  @Input() type: string = '';
  @Input() id: number = -1;
  @Input() position: Position = new Position();

  buttonList: string = '';

  constructor(private canvasManager: CanvasManagerService) { }

  ngOnInit(): void {
  }

  setMenu(id: number, type: string, position: Position): void {
    this.type = type;
    this.id = id;
    this.position = position;

    console.log("Menu: (%d, %d)", position.x, position.y);

    if (this.type == 'group') {
      this.buttonList = `<button (click)="removeGroup()">Remove</button>`
    } else if (this.type == 'transition') {

    }
  }

  removeGroup() {
    this.canvasManager.removeGroup(this.id);
  }

}
