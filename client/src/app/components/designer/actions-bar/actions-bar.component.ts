/*
This component displays the macro-actions available
to a user. Similar to the 'File' menu displayed in a
normal program.
*/

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CanvasManagerService } from 'src/app/services/canvas-manager.service';
import { InteractionManagerService } from 'src/app/services/interaction-manager.service';
import { ParameterManagerService } from 'src/app/services/parameter-manager.service';

@Component({
  selector: 'app-actions-bar',
  templateUrl: './actions-bar.component.html',
  styles: []
})
export class ActionsBarComponent implements OnInit {

  @ViewChild('interactionFileUpload') fileUpload!: ElementRef;

  isAddingGroup: boolean = false;
  isAddingTransition: boolean = false;

  constructor(
    private interactionManager: InteractionManagerService,
    private canvasManager: CanvasManagerService,
    private paramManager: ParameterManagerService
  ) {
    this.canvasManager.updateBtnState.subscribe(() => {
      this.updateButtonColors();
    });
  }

  ngOnInit(): void {
  }

  /* Action button click functions */
  addGroup() {
    if (this.interactionManager.isAddingGroup) {
      this.interactionManager.setAddingGroup(false);
    } else {
      this.interactionManager.setAddingGroup(true);
    }
  }

  addTransition() {
    if (this.interactionManager.addingTransition != 0) {
      this.interactionManager.setAddingTransition(0);
    } else {
      this.interactionManager.setAddingTransition(1);
    }
  }

  verifyModel() {
    console.log("Verify model");
  }

  saveToFile() {
    console.log("Save to file");

    let file = "interaction.json";
    let text = JSON.stringify(this.interactionManager.interaction);
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8, ' + encodeURIComponent(text));
    element.setAttribute('download', file);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  loadFromFile() {
    console.log("Load from file");
    this.fileUpload.nativeElement.click();
  }

  loadFromUpload(event: any) {
    this.interactionManager.loadInteractionFromJSONFile(event.target.files[0]);
  }

  clear() {
    this.interactionManager.clearCanvas();
    this.paramManager.updateCurrentMicro(undefined);
  }

  saveInteractionToLocal() {
    this.interactionManager.saveInteractionToLocal();
  }

  /* Update view functions */
  updateButtonColors() {
    if (this.interactionManager.isAddingGroup) {
      this.isAddingGroup = true;
      this.isAddingTransition = false;
      this.isAddingTransition = true;
    } else {
      this.isAddingGroup = false;
      this.isAddingTransition = false;
    }
  }
}
