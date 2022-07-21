import { Injectable, Output, EventEmitter } from '@angular/core';
import {Position} from '../models/position';

@Injectable({
  providedIn: 'root'
})
export class ContextMenuService {

  id: number = -1;
  type: string = '';
  position: Position = new Position();

  @Output() showContextMenu: EventEmitter<any> = new EventEmitter<any>();
  @Output() hideContextMenuEmitter: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  displayContextMenu(id: number, type: string, position: Position) {
    this.id = id;
    this.type = type;
    this.position = position;

    this.showContextMenu.emit();
  }

  hideContextMenu() {

  }

}
