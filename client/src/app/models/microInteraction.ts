import { Parameter } from "./parameter";
import { ParameterResult } from "./parameterResult";

export class MicroInteraction {

    id: number;
    groupId: number;
    type: string;
    parameters: Parameter[] = [];
    parameterResults: ParameterResult<any>[] = [];  
    //Note: results are stored as follows: {parameter id: resultString} (or list instead of result string case of type=array) so parameterResults looks like [{0,"yes"},{20,"option1"}] --these will be passed to backend along with the variable name(which is stored in parameter)

    constructor(id: number, groupId: number, type: string, parameters: Parameter[] = [], parameterResults: ParameterResult<any>[] = []) { //micros are built off a microType defined
        this.id = id;
        this.groupId = groupId;
        this.type = type;
        this.parameters = parameters;
        this.parameterResults = parameterResults;
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
