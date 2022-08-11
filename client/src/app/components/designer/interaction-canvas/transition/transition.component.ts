import { Component, OnInit } from '@angular/core';
import {Group} from 'src/app/models/group';
import {Transition} from 'src/app/models/transition';
import {CanvasManagerService} from 'src/app/services/canvas-manager.service';

@Component({
  selector: 'app-transition',
  templateUrl: './transition.component.html',
  styles: [
  ]
})
export class TransitionComponent implements OnInit {

  transition: Transition | undefined;

  width: number = 96;
  height: number = 192;
  arrowLength: number = 15;

  x1: string ='0px';
  y1: string ='0px';
  x2: string = '0px';
  y2: string = '0px';

  constructor(private canvasManager: CanvasManagerService) { }

  ngOnInit(): void {
  }

  setTransition(t: Transition) {
    this.transition = t;

    if (this.transition) {
      let group1 = this.canvasManager.getGroupById(this.transition.firstGroupId);
      let group2 = this.canvasManager.getGroupById(this.transition.secondGroupId);

      if (group1 && group2) {
        this.setOffsets(group1, group2);
      }
    }
  }

  setOffsets(g1: Group, g2: Group) {
    let newX1: number = g1.x;
    let newY1: number = g1.y;
    let newX2: number = g2.x;
    let newY2: number = g2.y;

    // x1 and y1 offsets
    if (g1.x < g2.x && (g2.x - g1.x) > this.width) {
      newX1 = g1.x + this.width;
      newY1 = g1.y + (this.height * (1/3));
    } else if (g1.x > g2.x && (g1.x - g2.x) > this.width) {
      newX1 = g1.x;
      newY1 = g1.y + (this.height * (2/3));
    } else if (g1.y > g2.y && (g1.y - g2.y) > this.height) {
      newX1 = g1.x + (this.width * (1/3));
      newY1 = g1.y;
    } else if (g1.y < g2.y && (g2.y - g1.y) > this.height) {
      newX1 = g1.x + (this.width * (2/3));
      newY1 = g1.y + this.height;
    }

    // calculate offset given arrow length
    let theta: number = Math.atan2(g1.y - g2.y, g1.x - g2.x);

    let xOff = this.arrowLength * Math.cos(theta);
    let yOff = this.arrowLength * Math.sin(theta);

    // x2 and y2 offsets
    if (g1.x > g2.x && (g1.x - g2.x) > this.width) {
      newX2 = g2.x + this.width;
      newY2 = g2.y + (this.height * (2/3));
    } else if (g1.x < g2.x && (g2.x - g1.x) > this.width) {
      newX2 = g2.x;
      newY2 = g2.y + (this.height * (1/3));
    } else if (g1.y < g2.y && (g2.y - g1.y) > this.height) {
      newX2 = g2.x + (this.width * (2/3));
      newY2 = g2.y;
    } else if (g1.y > g2.y && (g1.y - g2.y) > this.height) {
      newX2 = g2.x + (this.width * (1/3));
      newY2 = g2.y + this.height;
    }

    newX2 += xOff;
    newY2 += yOff;


    this.x1 = newX1 + "px";
    this.y1 = newY1 + "px";

    this.x2 = newX2 + "px";
    this.y2 = newY2 + "px";
  }

}
