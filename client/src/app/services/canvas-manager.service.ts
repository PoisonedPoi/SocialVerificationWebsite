import { EventEmitter, Injectable, Output } from '@angular/core';
import { Group } from '../models/group';
import { Interaction } from '../models/interaction';
import { Position } from '../models/position';
import { MicroInteraction } from '../models/microInteraction';

@Injectable({
  providedIn: 'root'
})
export class CanvasManagerService {

  interaction: Interaction = new Interaction();

  isAddingGroup: boolean = false;
  addingTransition: number = 0;
  currentMicroType: string = '';

  @Output() updateBtnState: EventEmitter<any> = new EventEmitter();
  @Output() getUpdatedInteraction: EventEmitter<Interaction> = new EventEmitter<Interaction>();

  canvasOffset: Position = new Position(0, 0);

  constructor() {}

  addGroup(x: number, y: number): Group {

    let isInitial: boolean = this.interaction.groupIdCounter == 0 ? true : false;
    let name: string = 'untitled' + this.interaction.groupIdCounter;

    let g = new Group(isInitial, this.interaction.groupIdCounter, name, x, y);

    this.interaction.groupIdCounter++;

    this.interaction.groups.push(g);

    this.getUpdatedInteraction.emit(this.interaction);

    return g;
  }

  removeGroup(groupId: number):void {
    this.interaction.removeGroup(groupId);

    if (this.interaction.groups.length == 0) {
      this.interaction.groupIdCounter = 0;
    }

    this.getUpdatedInteraction.emit(this.interaction);
  }

  addMicroToGroup(groupId: number): MicroInteraction  | null {

    const g: Group | undefined = this.interaction.getGroup(groupId);
    
    if (!g) {
      console.log("ERROR: add micro to group failure with groupId: %d", groupId);
      return null;
    }

    let m: MicroInteraction = new MicroInteraction(g.microIdCounter++, this.currentMicroType);

    g.micros.push(m);

    this.getUpdatedInteraction.emit(this.interaction);
    
    return m;
  }

  removeMicro(groupId: number, microId: number):void {
    const g: Group | undefined = this.interaction.getGroup(groupId);
    
    if (!g) {
      console.log("ERROR: remove micro failure with groupId: %d", groupId);
      return;
    }

    g.removeMicro(microId);

    this.getUpdatedInteraction.emit(this.interaction);
  }

  /* State management for view reflection */
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

  
  getGroupById(id: number): Group | undefined {
    let g: Group | undefined = this.interaction.groups.find((x: Group) => x.id === id);

    if (g) {
      return g;
    }
    return undefined;
  }

  updateGroup(group: Group) {
    let gs: Group[] = this.interaction.groups.filter((x: Group) => x.id != group.id);

    gs.push(group);

    this.interaction.groups = gs;

    this.getUpdatedInteraction.emit(this.interaction);
  }

  loadInteractionFromLocal(): void {
    let xmlString = localStorage.getItem('interactionXML');

    this.interaction = new Interaction(xmlString);

    this.getUpdatedInteraction.emit(this.interaction);
  }

  /* Save interaction to XML */
  saveInteractionToLocal() {
    let xmlString = this.interaction.exportModelToXML();

    localStorage.setItem('interactionXML', xmlString);
  }

  clearCanvas() {
    this.interaction = new Interaction(null);

    this.getUpdatedInteraction.emit(this.interaction);

    this.saveInteractionToLocal();
  }

}
