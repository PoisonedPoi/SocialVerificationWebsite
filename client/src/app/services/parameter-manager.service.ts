import { EventEmitter, Injectable, Output } from '@angular/core';
import {MicroInteraction} from '../models/microInteraction';

@Injectable({
  providedIn: 'root'
})
export class ParameterManagerService {

  micro: MicroInteraction | undefined = new MicroInteraction();

  @Output() getUpdatedMicro: EventEmitter<MicroInteraction> = new EventEmitter();

  constructor() { }

  updateCurrentMicro(micro: MicroInteraction | undefined) {
    this.micro = micro;
    this.getUpdatedMicro.emit(this.micro);
  }
}
