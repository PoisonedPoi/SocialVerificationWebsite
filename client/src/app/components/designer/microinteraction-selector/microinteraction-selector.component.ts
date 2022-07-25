import { Component, OnInit } from '@angular/core';
import {MicroType} from 'src/app/models/microType';

@Component({
  selector: 'app-microinteraction-selector',
  templateUrl: './microinteraction-selector.component.html',
  styleUrls: []
})
export class MicrointeractionSelectorComponent implements OnInit {

  microTypes: MicroType[] = [
    new MicroType("Greeter", []),
    new MicroType("Ask", []),
    new MicroType("Farewell", []),
  ];

  constructor() { }

  ngOnInit(): void {
  }

  dragStart(event: any) {
    let microData = JSON.stringify(this.microTypes[0]);
    event.dataTransfer.setData("microData", microData);
  }
}
