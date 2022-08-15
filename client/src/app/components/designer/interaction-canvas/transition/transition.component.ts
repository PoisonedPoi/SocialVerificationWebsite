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

  isLine: boolean = true;

  width: number = 96;
  height: number = 192;
  arrowLength: number = 15;

  x1: string ='0px';
  y1: string ='0px';
  x2: string = '0px';
  y2: string = '0px';
  d: string = 'M 130 110 C 120 140, 180 140, 170 110';

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

    if (g1.id === g2.id) {
      this.isLine = false;
      this.setSelfOffsets(g1);
      return;
    }
    
    this.isLine = true;

    // Calculate in and out anchor positions

    let EOut: {x: number, y: number} = {x: g1.x + this.width, y: g1.y + (this.height * (1/3))};
    let WOut: {x: number, y: number} = {x: g1.x, y: g1.y + (this.height * (2/3))};
    let NOut: {x: number, y: number} = {x: g1.x + (this.width * (1/3)), y: g1.y};
    let SOut: {x: number, y: number} = {x: g1.x + (this.width * (2/3)), y: g1.y + this.height};

    let EIn:  {x: number, y: number} = {x: g2.x + this.width, y: g2.y + (this.height * (2/3))};
    let WIn:  {x: number, y: number} = {x: g2.x, y: g2.y + (this.height * (1/3))};
    let NIn:  {x: number, y: number} = {x: g2.x + (this.width * (2/3)), y: g2.y};
    let SIn:  {x: number, y: number} = {x: g2.x + (this.width * (1/3)), y: g2.y + this.height};

    let outAnchors = [EOut, WOut, NOut, SOut];
    let inAnchors = [EIn, WIn, NIn, SIn];

    // Get distances between in and out anchors
    let distances: {p1: {x: number, y: number}, p2: {x: number, y: number}, distance: number}[] = [];

    outAnchors.forEach((outAnchor) => {
      inAnchors.forEach((inAnchor) => {
        let d = Math.sqrt(Math.pow(outAnchor.x - inAnchor.x, 2) + Math.pow(outAnchor.y - inAnchor.y, 2));
        distances.push({ p1: outAnchor, p2: inAnchor, distance: d });
      });
    });

    // Get the points with the smallest distance
    let smallest = distances.pop();
    distances.forEach((line) => {
        if (smallest && line.distance < smallest.distance) {
            smallest = line;
        }
    });

    // Set the arrow offset 
    let theta: number = Math.atan2(g1.y - g2.y, g1.x - g2.x);

    let xOff = this.arrowLength * Math.cos(theta);
    let yOff = this.arrowLength * Math.sin(theta);

    // Set the offsets
    if (smallest) {
      this.x1 = smallest.p1.x + "px";
      this.y1 = smallest.p1.y + "px";

      this.x2 = smallest.p2.x + xOff + "px";
      this.y2 = smallest.p2.y + yOff + "px";
    }

  }

  setSelfOffsets(g: Group) {
    let NOutX = g.x + this.width / 3
    let EInY = g.y + this.height / 3

    this.d = 'M ' + NOutX + ' ' + g.y +
      ' C ' + g.x + ' ' + (g.y - 50) + ', ' +
      (g.x - 60) + ' ' + g.y + ', ' + (g.x - 10) + ' ' + (EInY - 15);
  }

}
