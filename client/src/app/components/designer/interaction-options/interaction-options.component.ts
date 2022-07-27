import { Component, OnInit } from '@angular/core';
import { MicroInteraction } from 'src/app/models/microInteraction';
import {ParameterManagerService} from 'src/app/services/parameter-manager.service';

@Component({
  selector: 'app-interaction-options',
  templateUrl: './interaction-options.component.html',
  styleUrls: []
})
export class InteractionOptionsComponent implements OnInit {

  currentMicro: MicroInteraction | null = null;

  constructor(private parameterManager: ParameterManagerService) { }

  ngOnInit(): void {
    this.parameterManager.getUpdatedMicro.subscribe((m: MicroInteraction) => {
      this.currentMicro = m;
    });
  }

  saveOptions() {
    console.log("Save params");
  }

  discardOptions() {
    console.log("Discard params");
  }
}
