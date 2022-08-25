import { EventEmitter, Injectable, Output } from '@angular/core';
import { Group } from '../models/group';
import { Interaction } from '../models/interaction';
import { Position } from '../models/position';
import { MicroInteraction } from '../models/microInteraction';
import {Parameter} from '../models/parameter';
import {MicroType} from '../models/microType';
import {ParameterResult} from '../models/parameterResult';
import { getTrackedMicroTypes } from '../models/trackedMicroTypes';
import {Transition} from '../models/transition';

@Injectable({
  providedIn: 'root'
})
export class InteractionManagerService {

  interaction: Interaction = new Interaction();

  isAddingGroup: boolean = false;
  addingTransition: number = 0;
  currentTransition: Transition;

  currentMicroType: string = '';

  @Output() updateBtnState: EventEmitter<any> = new EventEmitter();
  @Output() getUpdatedInteraction: EventEmitter<Interaction> = new EventEmitter<Interaction>();

  canvasOffset: Position = new Position(0, 0);
  canvasScrollOffset: Position = new Position(0, 0);

  constructor() {
    this.currentTransition = new Transition(-1, -1, -1);
  }

  /* Group related CRUD functions */

  addGroup(x: number, y: number): Group {

    let isInitial: boolean = this.interaction.groupIdCounter == 0 ? true : false;
    let name: string = 'untitled' + this.interaction.groupIdCounter;

    let g = new Group(isInitial, this.interaction.groupIdCounter, name, x + this.canvasScrollOffset.x, y + this.canvasScrollOffset.y);

    this.interaction.groupIdCounter++;

    this.interaction.groups.push(g);

    this.getUpdatedInteraction.emit(this.interaction);

    return g;
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

  removeGroup(groupId: number):void {
    // Remove transitions associated with the groupId
    let ts: Transition[] = this.interaction.transitions.filter((x: Transition) => x.firstGroupId != groupId && x.secondGroupId != groupId);

    this.interaction.transitions = ts;

    // Remove the group from the groups list
    let gs: Group[] = this.interaction.groups.filter((x: Group) => x.id != groupId);

    this.interaction.groups = gs;

    if (this.interaction.groups.length == 0) {
      this.interaction.groupIdCounter = 0;
    }

    this.getUpdatedInteraction.emit(this.interaction);
  }
  
  /* Micro related CRUD functions */

  addMicroToGroup(groupId: number): MicroInteraction  | null {

    let trackedMicroTypes: MicroType[] = getTrackedMicroTypes();

    const g: Group | undefined = this.interaction.getGroup(groupId);
    
    if (!g) {
      console.log("ERROR: add micro to group failure with groupId: %d", groupId);
      return null;
    }

    let params: Parameter[] = [];

    let mt: MicroType | undefined = trackedMicroTypes.find((m: MicroType) => m.type === this.currentMicroType);

    if (mt) {
      params = mt.parameters;
    }

    let m: MicroInteraction = new MicroInteraction(g.microIdCounter++, g.id, this.currentMicroType, params);

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

  /* Parameter related CRUD functions */
  
  updateParams(groupId: number, microId: number, paramRes: ParameterResult[]) {
    let g = this.interaction.groups.find(group => group.id === groupId);

    if (g) {
      let m = g.micros.find(micro => micro.id === microId);
      if (m) {
        m.updateResults(paramRes);

        this.getUpdatedInteraction.emit(this.interaction);
      }
    }
  }

  /* Transition related CRUD functions */

  removeTransition(tid: number) {
    let ts: Transition[] = this.interaction.transitions.filter((x: Transition) => x.id != tid);

    this.interaction.transitions = ts;

    if (this.interaction.transitions.length == 0) {
      this.interaction.transitionIdCounter = 0;
    }

    this.getUpdatedInteraction.emit(this.interaction);
  }

  setGroup1Id(gid: number) {
    this.currentTransition = new Transition();
    this.currentTransition.firstGroupId = gid;
    this.addingTransition++;
  }

  setGroup2Id(gid: number) {

    // Check that this is going to be a unique transition
    let dup = this.interaction.transitions.find((t: Transition) => t.firstGroupId == this.currentTransition.firstGroupId && t.secondGroupId == gid);

    if (dup != undefined) {
      return;
    }

    this.currentTransition.secondGroupId = gid;

    this.currentTransition.id = this.interaction.transitionIdCounter;
    this.interaction.transitionIdCounter++;

    this.interaction.transitions.push(this.currentTransition);

    this.getUpdatedInteraction.emit(this.interaction);

    this.setAddingTransition(0);
  }

  updateTransition(transition: Transition) {
    let ts: Transition[] = this.interaction.transitions.filter((x: Transition) => x.id != transition.id);

    ts.push(transition);

    this.interaction.transitions = ts;

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

  /* Loading from file on disk */

  async loadInteractionFromJSONFile(file: File) {
    let t: string = await file.text();

    this.interaction = new Interaction(t);

    this.getUpdatedInteraction.emit(this.interaction);
  }

  /* Save and load interaction from local storage */

  loadInteractionFromLocal(): void {
    let interactionString = localStorage.getItem('interaction');

    if (interactionString) {
      this.interaction = new Interaction(interactionString);
    } else {
      this.interaction = new Interaction();
    }

    this.getUpdatedInteraction.emit(this.interaction);
  }

  saveInteractionToLocal() {
    localStorage.setItem('interaction', JSON.stringify(this.interaction));
  }

  /* New interaction */

  clearCanvas() {
    this.interaction = new Interaction();

    this.getUpdatedInteraction.emit(this.interaction);

    this.saveInteractionToLocal();
  }

}