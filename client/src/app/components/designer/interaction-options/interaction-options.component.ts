/*
This component displays the current parameters for
the currently selected microinteraction. The parameters
can be modified and therefore update the current interaction.
The parameters are housed in a child component and this component
communicates with its child to reflect the appropriate parameter
results.
*/

import { Component, OnInit } from '@angular/core';
import { MicroInteraction } from 'src/app/models/microInteraction';
import { ParameterResult } from 'src/app/models/parameterResult';
import { InteractionManagerService } from 'src/app/services/interaction-manager.service';
import { ParameterManagerService } from 'src/app/services/parameter-manager.service';

@Component({
  selector: 'app-interaction-options',
  templateUrl: './interaction-options.component.html',
  styleUrls: []
})
export class InteractionOptionsComponent implements OnInit {

  micro: MicroInteraction | undefined;
  paramRes: ParameterResult[] = [];


  constructor(
    private parameterManager: ParameterManagerService,
    private interactionManager: InteractionManagerService
  ) { }

  ngOnInit(): void {
    this.parameterManager.getUpdatedMicro.subscribe((m: MicroInteraction | undefined) => {
      this.micro = m;
      if (this.micro) {
        this.paramRes = this.micro.parameterResults;
      }
    });
  }

  /* Updates the current microinteraction in the interaction model */
  saveOptions() {
    if (this.micro) {
      this.interactionManager.updateParams(this.micro.id, this.paramRes);
    }
  }

  /* Updates the paramter results for a specific parameter
     Called by the child components
  */
  setResults(idx: number, result: ParameterResult) {
    this.paramRes[idx] = result;
  }
}
