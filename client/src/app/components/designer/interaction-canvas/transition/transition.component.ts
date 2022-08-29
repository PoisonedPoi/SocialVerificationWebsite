/*
This component displays a transition between two microinteractions.
*/

import { Component, OnInit } from '@angular/core';
import { Transition } from 'src/app/models/transition';
import { Position } from 'src/app/models/position';
import { InteractionManagerService } from 'src/app/services/interaction-manager.service';
import { ContextMenuService } from 'src/app/services/context-menu.service';
import {MicroInteraction} from 'src/app/models/microInteraction';

@Component({
  selector: 'app-transition',
  templateUrl: './transition.component.html',
  styles: [
  ]
})
export class TransitionComponent implements OnInit {

  transition: Transition = new Transition();

  isReady: boolean = false;
  isNotReady: boolean = false;

  isLine: boolean = true;

  width: number = 96;
  height: number = 176;
  arrowLength: number = 15;

  x1: string ='0px';
  y1: string ='0px';
  x2: string = '0px';
  y2: string = '0px';
  d: string = '';

  conditionsX: string = '0px';
  conditionsY: string = '0px';

  constructor(
    private interactionManager: InteractionManagerService,
    private contextMenu: ContextMenuService,
  ) { }

  ngOnInit(): void {
  }

  showContextMenu(event: any) {
    if (this.contextMenu.type != '') {
      return;
    }

    event.preventDefault();

    let xNum: number = parseInt(this.conditionsX.substring(0, this.conditionsX.length - 2));
    let yNum: number = parseInt(this.conditionsY.substring(0, this.conditionsY.length - 2));

    this.contextMenu.displayContextMenu('transition', new Position(xNum + 50, yNum + 25), -1, this.transition.id);
  }

  setTransition(t: Transition) {
    this.transition = t;

    if (this.transition) {
      let firstMicro = this.interactionManager.getMicroById(this.transition.firstMicroId);
      let secondMicro = this.interactionManager.getMicroById(this.transition.secondMicroId);

      this.isReady = this.transition.ready;
      this.isNotReady = this.transition.notReady;

      if (firstMicro && secondMicro) {
        this.setOffsets(firstMicro, secondMicro);
      }
    }
  }

  setOffsets(m1: MicroInteraction, m2: MicroInteraction) {

    if (m1.id === m2.id) {
      this.isLine = false;
      this.setSelfOffsets(m1);
      return;
    }

    this.isLine = true;

    // Calculate in and out anchor positions

    let EOut: {x: number, y: number} = {x: m1.x + this.width, y: m1.y + (this.height * (1/3))};
    let WOut: {x: number, y: number} = {x: m1.x, y: m1.y + (this.height * (2/3))};
    let NOut: {x: number, y: number} = {x: m1.x + (this.width * (1/3)), y: m1.y};
    let SOut: {x: number, y: number} = {x: m1.x + (this.width * (2/3)), y: m1.y + this.height};

    let EIn:  {x: number, y: number} = {x: m2.x + this.width, y: m2.y + (this.height * (2/3))};
    let WIn:  {x: number, y: number} = {x: m2.x, y: m2.y + (this.height * (1/3))};
    let NIn:  {x: number, y: number} = {x: m2.x + (this.width * (2/3)), y: m2.y};
    let SIn:  {x: number, y: number} = {x: m2.x + (this.width * (1/3)), y: m2.y + this.height};

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
    let theta: number = Math.atan2(m1.y - m2.y, m1.x - m2.x);

    let xOff = this.arrowLength * Math.cos(theta);
    let yOff = this.arrowLength * Math.sin(theta);

    // Set the offsets
    if (smallest) {
      this.x1 = smallest.p1.x + "px";
      this.y1 = smallest.p1.y + "px";

      this.x2 = smallest.p2.x + xOff + "px";
      this.y2 = smallest.p2.y + yOff + "px";

      this.conditionsX = (((smallest.p1.x + (smallest.p2.x - 176)) / 2)) + "px";
      this.conditionsY = (((smallest.p1.y + smallest.p2.y) / 2) - 20) + "px";

    }
  }

  setSelfOffsets(m: MicroInteraction) {
    let NOutX = m.x + this.width / 3
    let EInY = m.y + this.height / 3

    this.conditionsX = (m.x - 100) + "px";
    this.conditionsY = (m.y - 50) + "px";

    this.d = 'M ' + NOutX + ' ' + m.y +
      ' C ' + m.x + ' ' + (m.y - 50) + ', ' +
      (m.x - 60) + ' ' + m.y + ', ' + (m.x - 10) + ' ' + (EInY - 15);
  }

  updateTransition() {
    this.transition.ready = this.isReady;
    this.transition.notReady = this.isNotReady;
    this.interactionManager.updateTransition(this.transition);
  }

}
