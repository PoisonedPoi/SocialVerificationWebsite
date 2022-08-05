import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {MicroInteraction} from 'src/app/models/microInteraction';
import {Parameter} from 'src/app/models/parameter';
import {ParameterResult} from 'src/app/models/parameterResult';
import {ParameterManagerService} from 'src/app/services/parameter-manager.service';

@Component({
  selector: 'app-parameter-options',
  templateUrl: './parameter-options.component.html',
  styles: [
  ]
})
export class ParameterOptionsComponent implements OnInit {

  @Input() microType: string | null = '';
  @Input() param: Parameter = new Parameter();
  @Input() name: string = '';
  @Input() index: number = -1;
  @Input() result: ParameterResult = new ParameterResult();

  paramRes: ParameterResult | null = null;
  @Output() resultEmitter = new EventEmitter<ParameterResult>();


  // array type
  responses: Map<string, string> = new Map();

  humanState: string = '';
  response: string = '';

  // int type
  intVal: number | null = 3;

  // str type
  strVal: string | null = '';

  // bool type
  boolVal: boolean | null = false;
  
  constructor() { }

  ngOnInit(): void {
    if (this.result) {
      this.paramRes = this.result;
    }

    this.setView();

    if (this.param.type == "int") {
      this.resultEmitter.emit(new ParameterResult(this.index, 'int', null, this.intVal, null, null));
    }
  }

  setView() {
    if (this.paramRes) {
      if (this.paramRes.type == 'bool') {
        this.boolVal = this.paramRes.boolResult;
      } else if (this.paramRes.type == 'int') {
        this.intVal = this.paramRes.intResult;
      } else if (this.paramRes.type == 'str') {
        this.strVal = this.paramRes.strResult;
      } else if (this.paramRes.type == 'array') {
        if (this.paramRes.arrayResult) {
          this.responses = this.paramRes.arrayResult;
        }
      }
    }
  }

  addResponse() {
    this.responses.set(this.humanState, this.response);
    this.humanState = '';
    this.response = '';

    this.paramRes = new ParameterResult(this.index, 'array', null, null, null, this.responses);
    this.resultEmitter.emit(this.paramRes);
  }

  removeResponse(key: string) {
    this.responses.delete(key);

    this.paramRes = new ParameterResult(this.index, 'array', null, null, null, this.responses);
    this.resultEmitter.emit(this.paramRes);
  }

  changeBoolVal(v: boolean) {
    this.boolVal = v;
    this.paramRes = new ParameterResult(this.index, 'bool', v, null, null, null);
    this.resultEmitter.emit(this.paramRes);
  }

  changeStrVal(event: any) {
    this.strVal = event.target.value;
    this.paramRes = new ParameterResult(this.index, 'str', null, null, event.target.value, null);
    this.resultEmitter.emit(this.paramRes);
  }

  changeIntVal(event: any) {
    this.intVal = event.target.value;
    this.paramRes = new ParameterResult(this.index, 'int', null, event.target.value, null, null);
    this.resultEmitter.emit(this.paramRes);
  }
}
