import { Parameter } from "./parameter";
import { ParameterResult } from "./parameterResult";
import { MicroType } from "./microType";
import { getTrackedMicroTypes } from "./trackedMicroTypes";

export class MicroInteraction {

    id: number;
    x: number;
    y: number;
    type: string | null; // i.e. 'Greeter', 'Farewell'
    parameters: Parameter[] = [];
    parameterResults: ParameterResult[] = [];  
    //Note: results are stored as follows: {parameter id: resultString} (or list instead of result string case of type=array) so parameterResults looks like [{0,"yes"},{20,"option1"}] --these will be passed to backend along with the variable name(which is stored in parameter)

    constructor(id: number = -1, x: number = 0, y: number = 0, type: string = '', parameters: Parameter[] = [], parameterResults: ParameterResult[] = []) { //micros are built off a microType defined
        this.id = id;
        this.x = x;
        this.y = y;
        this.type = type;
        this.parameters = parameters;
        if (parameterResults == []) {
          this.parameters.forEach(parameter => {
            if (parameter.type == "bool") {
              this.parameterResults.push(new ParameterResult(parameter.id, 'bool'));
            } else if (parameter.type == "str") {
              this.parameterResults.push(new ParameterResult(parameter.id, 'str'));
            } else if (parameter.type == "int") {
              this.parameterResults.push(new ParameterResult(parameter.id, 'int'));
            } else if (parameter.type == "array") {
              this.parameterResults.push(new ParameterResult(parameter.id, 'array'));
            }
          });
        } else {
          this.parameterResults = parameterResults;
        }
    }

    updateResults(results: ParameterResult[]) {
        this.parameterResults = results;
    }
}
