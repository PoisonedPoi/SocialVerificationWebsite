import { identifierName } from '@angular/compiler';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { Group } from '../models/group';

@Injectable({
  providedIn: 'root'
})
export class CanvasManagerService {

  isAddingGroup: boolean = false;
  addingTransition: number = 0;

  groupIdCounter: number = 0;
  groups: Group[] = [];

  @Output() updateBtnState: EventEmitter<any> = new EventEmitter();
  @Output() getUpdatedGroups: EventEmitter<Group[]> = new EventEmitter<Group[]>();

  constructor() {}

  addGroup(x: number, y: number): number {
    this.groupIdCounter++;

    let g = new Group(this.groupIdCounter, false);

    g.x = x;
    g.y = y;

    if (this.groupIdCounter == 1) {
      g.initialGroup = true;
    }

    this.groups.push(g);

    this.getUpdatedGroups.emit(this.groups);

    console.log(this.groups);

    return g.id;
  }

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

  getGroupById(id: number): Group {
    console.log(id);
    console.log("Groups");
    console.log(this.groups);

    let g: Group | undefined = this.groups.find((x: Group) => x.id === id);

    if (g) {
      console.log(g);
      return g;
    }
    console.log("Not found");
    return new Group(id, false);
  }
}