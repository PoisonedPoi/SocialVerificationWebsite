import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CanvasManagerService {

  isAddingGroup: boolean = false;
  addingTransition: number = 0;

  @Output() updateBtnState: EventEmitter<any> = new EventEmitter();

  constructor() { }

  setAddingGroup(val: boolean) {
    this.isAddingGroup = val;
    this.addingTransition = 0;

    this.updateBtnState.emit();
  }

  setAddingTransition(val: number) {
    this.addingTransition = val;
    this.isAddingGroup = false;

    this.updateBtnState.emit();
  }


}