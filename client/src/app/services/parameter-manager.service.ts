import { EventEmitter, Injectable, Output } from '@angular/core';
import {MicroInteraction} from '../models/microInteraction';
import {Parameter} from '../models/parameter';

@Injectable({
  providedIn: 'root'
})
export class ParameterManagerService {

  currentParameter: Parameter | null = null;
  //currentMicro: MicroInteraction | null = null;

  @Output() getUpdatedMicro: EventEmitter<MicroInteraction> = new EventEmitter();

  constructor() { }

}
