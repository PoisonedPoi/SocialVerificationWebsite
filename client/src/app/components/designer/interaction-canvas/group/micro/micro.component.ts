import { Component, OnInit, Input } from '@angular/core';
import {MicroInteraction} from 'src/app/models/microInteraction';

@Component({
  selector: 'app-micro',
  templateUrl: './micro.component.html',
  styles: [
  ]
})
export class MicroComponent implements OnInit {

  @Input() micro: MicroInteraction = new MicroInteraction(1, 'Greeter');

  constructor() { }

  ngOnInit(): void {
  }

  setMicro(m: MicroInteraction) {
    this.micro = m;
  }

}
