import { Component, OnInit } from '@angular/core';
import { MicroInteraction } from 'src/app/models/microInteraction';
import {ParameterResult} from 'src/app/models/parameterResult';
import {CanvasManagerService} from 'src/app/services/canvas-manager.service';
import {ParameterManagerService} from 'src/app/services/parameter-manager.service';

@Component({
  selector: 'app-interaction-options',
  templateUrl: './interaction-options.component.html',
  styleUrls: []
})
export class InteractionOptionsComponent implements OnInit {

  micro: MicroInteraction | null = null;
  paramRes: ParameterResult[] = [];


  constructor(private parameterManager: ParameterManagerService, private canvasManager: CanvasManagerService) { }

  ngOnInit(): void {
    this.parameterManager.getUpdatedMicro.subscribe((m: MicroInteraction) => {
      this.micro = m;
      this.paramRes = this.micro.parameterResults;
      console.log(this.paramRes);
    });
  }

  saveOptions() {
    // Tell canvas manager to updateParams
    if (this.micro) {
      this.canvasManager.updateParams(this.micro.groupId, this.micro.id, this.paramRes);
    }
  }

  setResults(idx: number, result: ParameterResult) {
    this.paramRes[idx] = result;
  } 
}
