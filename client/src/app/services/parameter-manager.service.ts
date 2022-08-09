/*
This service manages state for the current microinteraction
displayed in the interaction options pane.
*/

import { EventEmitter, Injectable, Output } from '@angular/core';
import {MicroInteraction} from '../models/microInteraction';

@Injectable({
  providedIn: 'root'
})
export class ParameterManagerService {

  micro: MicroInteraction | undefined;

  @Output() getUpdatedMicro: EventEmitter<MicroInteraction | undefined> = new EventEmitter();

  constructor() { }

  updateCurrentMicro(micro: MicroInteraction | undefined) {
    this.micro = micro;
    this.getUpdatedMicro.emit(this.micro);
  }
}
