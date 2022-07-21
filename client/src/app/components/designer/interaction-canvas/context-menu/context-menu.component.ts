import { Component, OnInit, Input } from '@angular/core';
import {Position} from 'src/app/models/position';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styles: [
  ]
})
export class ContextMenuComponent implements OnInit {
  
  @Input() type: string = '';
  @Input() id: number = -1;
  @Input() position: Position = {x: 0, y: 0};


  constructor() { }

  ngOnInit(): void {
  }

}
