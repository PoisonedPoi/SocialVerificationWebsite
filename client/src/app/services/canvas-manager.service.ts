/*
This service manages the properties of the canvas in which
interactions are displayed.
*/

import { Injectable, Output, EventEmitter } from '@angular/core';
import { Position } from '../models/position';

@Injectable({
  providedIn: 'root'
})
export class CanvasManagerService {

  @Output() updateBtnState: EventEmitter<any> = new EventEmitter();

  canvasOffset: Position = new Position(0, 0);
  canvasScrollOffset: Position = new Position(0, 0);

  constructor() { }
}
