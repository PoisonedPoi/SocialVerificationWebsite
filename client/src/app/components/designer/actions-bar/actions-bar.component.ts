import { Component, OnInit } from '@angular/core';
import { CanvasManagerService } from 'src/app/services/canvas-manager.service';

@Component({
  selector: 'app-actions-bar',
  templateUrl: './actions-bar.component.html',
  styleUrls: ['./actions-bar.component.css']
})
export class ActionsBarComponent implements OnInit {

  addGroupPressed: boolean = false;
  addTransitionPressed: boolean = false;
  

  constructor(private canvasManager: CanvasManagerService) {
    canvasManager.updateBtnState.subscribe(() => {
      this.updateButtonColors();
    });
  }

  ngOnInit(): void {
  }

  newGroup() {
    this.canvasManager.setAddingGroup(true);
  }

  newTransition() {
    this.canvasManager.setAddingTransition(1);
  }

  updateButtonColors() {
    if (this.canvasManager.isAddingGroup) {
      this.addGroupPressed = true;
      this.addTransitionPressed = false;
    } else if (this.canvasManager.addingTransition != 0) {
      this.addGroupPressed = false;
      this.addTransitionPressed = true;
    } else {
      this.addGroupPressed = false;
      this.addTransitionPressed = false;
    }
  
  }
}
