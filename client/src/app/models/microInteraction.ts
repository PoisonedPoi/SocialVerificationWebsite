import { MicroType } from "./microType";
import { Parameter } from "./parameter";
import { ParameterResult } from "./parameterResult";

export class MicroInteraction {

    id: string;
    type: string;
    parameters: Parameter[] = [];
    parameterResults: ParameterResult<any>[] = [];  
    //Note: results are stored as follows: {parameter id: resultString} (or list instead of result string case of type=array) so parameterResults looks like [{0,"yes"},{20,"option1"}] --these will be passed to backend along with the variable name(which is stored in parameter)

    constructor(id: string, microType: MicroType) { //micros are built off a microType defined
        this.type = microType.type;
        this.parameters = microType.parameters;
        this.id = id;
        this.parameterResults = [];
        this.parameters.forEach(parameter => {
            if (parameter.type == "bool") {
                this.parameterResults.push(new ParameterResult<boolean>(parameter.id, false));
            } else if (parameter.type == "str") {
                this.parameterResults.push(new ParameterResult<string>(parameter.id, ''));
            } else if (parameter.type == "int") {
                this.parameterResults.push(new ParameterResult<number>(parameter.id, 0));
            } else if (parameter.type == "array") {
                this.parameterResults.push(new ParameterResult<any>(parameter.id, []));
            }

        });
    }

    updateResults<T>(results: ParameterResult<T>[]) {
        this.parameterResults = results;
    }
}