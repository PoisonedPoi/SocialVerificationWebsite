import { Component, OnInit } from '@angular/core';
import { CanvasManagerService } from 'src/app/services/canvas-manager.service';

@Component({
  selector: 'app-actions-bar',
  templateUrl: './actions-bar.component.html',
  styles: [
  ]
})
export class ActionsBarComponent implements OnInit {

  isAddingGroup: boolean = false;
  isAddingTransition: boolean = false;
  

  constructor(private canvasManager: CanvasManagerService) {
    canvasManager.updateBtnState.subscribe(() => {
      this.updateButtonColors();
    });
  }

  ngOnInit(): void {
  }

  /* Action button click functions */
  addGroup() {
    this.canvasManager.setAddingGroup(true);
  }

  addTransition() {
    this.canvasManager.setAddingTransition(1);
  }

  exportToXML() {
    console.log("Export to XML");
  }

  verifyModel() {
    console.log("Verify model");
  }

  saveToFile() {
    console.log("Save to file");
  }

  loadFromFile() {
    console.log("Load from file");
  }

  clear() {
    console.log("Clear");
  }

  /* Update view functions */
  updateButtonColors() {
    if (this.canvasManager.isAddingGroup) {
      this.isAddingGroup = true;
      this.isAddingTransition = false;
    } else if (this.canvasManager.addingTransition != 0) {
      this.isAddingGroup = false;
      this.isAddingTransition = true;
    } else {
      this.isAddingGroup = false;
      this.isAddingTransition = false;
    }
  
  }
}
