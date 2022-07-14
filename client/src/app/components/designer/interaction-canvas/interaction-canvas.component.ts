import { Component, OnInit } from '@angular/core';
import { CanvasManagerService } from 'src/app/services/canvas-manager.service';

@Component({
  selector: 'app-interaction-canvas',
  templateUrl: './interaction-canvas.component.html',
  styleUrls: ['./interaction-canvas.component.css']
})
export class InteractionCanvasComponent implements OnInit {

  constructor(private canvasManager: CanvasManagerService) { }

  ngOnInit(): void {
  }

  clickCanvas(event: any) {
    if (this.canvasManager.isAddingGroup) {
      console.log('Add group here (%d,%d)', event.offsetX, event.offsetY);

      this.canvasManager.setAddingGroup(false);
    } else if (this.canvasManager.addingTransition == 1) {
      console.log('Init transition here (%d,%d)', event.offsetX, event.offsetY);

      this.canvasManager.setAddingTransition(2);
    }  else if (this.canvasManager.addingTransition == 2) {
      console.log('Final transition here (%d,%d)', event.offsetX, event.offsetY);

      this.canvasManager.setAddingTransition(0);
    }
  }

}
