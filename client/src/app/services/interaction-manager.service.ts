/*
This service manages the current interaction being built.
*/

import { EventEmitter, Injectable, Output } from '@angular/core';
import { Interaction } from '../models/interaction';
import { MicroInteraction } from '../models/microInteraction';
import { Parameter } from '../models/parameter';
import { MicroType } from '../models/microType';
import { ParameterResult } from '../models/parameterResult';
import { getTrackedMicroTypes } from '../models/trackedMicroTypes';
import { Transition } from '../models/transition';

@Injectable({
  providedIn: 'root'
})
export class InteractionManagerService {

  interaction: Interaction = new Interaction();

  currentTransition: Transition;
  isAddingTransition: boolean = false;

  currentMicroType: string = '';

  @Output() getUpdatedInteraction: EventEmitter<Interaction> = new EventEmitter<Interaction>();


  constructor(
  ) {
    this.currentTransition = new Transition(-1, -1, -1);
  }

  /* Micro related CRUD functions */

  updateMicro(micro: MicroInteraction) {
    let ms: MicroInteraction[] = this.interaction.micros.filter((x: MicroInteraction) => x.id != micro.id);

    ms.push(micro);

    this.interaction.micros = ms;

    this.getUpdatedInteraction.emit(this.interaction);
  }

  getMicroById(mid: number) {
    let m: MicroInteraction | undefined = this.interaction.micros.find((x: MicroInteraction) => x.id === mid);

    return m;
  }

  addMicro(x: number, y: number): MicroInteraction | null {

    let trackedMicroTypes: MicroType[] = getTrackedMicroTypes();

    let params: Parameter[] = [];

    let mt: MicroType | undefined = trackedMicroTypes.find((m: MicroType) => m.type === this.currentMicroType);

    if (mt) {
      params = mt.parameters;
    }

    let m: MicroInteraction = new MicroInteraction(this.interaction.microIdCounter++, x, y, this.currentMicroType, params);

    this.interaction.micros.push(m);

    this.getUpdatedInteraction.emit(this.interaction);

    return m;
  }

  removeMicro(microId: number):void {

    let m = this.getMicroById(microId);
    if (m == undefined) {
      console.log("no such micro");
    }

    // Remove transitions associated with the microId
    let ts: Transition[] = this.interaction.transitions.filter((x: Transition) => x.firstMicroId != microId && x.secondMicroId != microId);

    this.interaction.transitions = ts;

    // Remove the micro from the micros list
    let ms: MicroInteraction[] = this.interaction.micros.filter((x: MicroInteraction) => x.id != microId);

    this.interaction.micros = ms;

    if (this.interaction.micros.length == 0) {
      this.interaction.microIdCounter = 0;
    }

    this.getUpdatedInteraction.emit(this.interaction);
  }

  /* Parameter related CRUD functions */

  updateParams(microId: number, paramRes: ParameterResult[]) {
    let m = this.interaction.micros.find(micro => micro.id === microId);

    if (m) {
      m.updateResults(paramRes);

      this.getUpdatedInteraction.emit(this.interaction);
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

  setFirstMicroId(mid: number) {
    this.currentTransition = new Transition();
    this.currentTransition.firstMicroId = mid;
    this.isAddingTransition = true;
  }

  setSecondMicroId(mid: number) {

    // Check that this is going to be a unique transition
    let dup = this.interaction.transitions.find((t: Transition) => t.firstMicroId == this.currentTransition.firstMicroId && t.secondMicroId == mid);

    if (dup != undefined) {
      return;
    }

    this.currentTransition.secondMicroId = mid;
    this.isAddingTransition = false;

    this.currentTransition.id = this.interaction.transitionIdCounter;
    this.interaction.transitionIdCounter++;

    this.interaction.transitions.push(this.currentTransition);

    this.getUpdatedInteraction.emit(this.interaction);
  }

  updateTransition(transition: Transition) {
    let ts: Transition[] = this.interaction.transitions.filter((x: Transition) => x.id != transition.id);

    ts.push(transition);

    this.interaction.transitions = ts;

    this.getUpdatedInteraction.emit(this.interaction);
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
