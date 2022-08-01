import { Component, OnInit, Input, Output } from '@angular/core';
import {Parameter} from 'src/app/models/parameter';

@Component({
  selector: 'app-parameter-options',
  templateUrl: './parameter-options.component.html',
  styles: [
  ]
})
export class ParameterOptionsComponent implements OnInit {

  @Input() microType: string | null = '';
  @Input() param: Parameter = new Parameter();

  @Output() val: any = null;

  responses: Map<string, string> = new Map();

  humanState: string = '';
  response: string = '';
  
  constructor() { }

  ngOnInit(): void {
  }

  addResponse() {
    this.responses.set(this.humanState, this.response);
    this.humanState = '';
    this.response = '';
  }

  removeResponse(key: string) {
    this.responses.delete(key);
  }

}
