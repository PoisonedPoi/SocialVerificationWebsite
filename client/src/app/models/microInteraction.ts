import { Parameter } from "./parameter";
import { ParameterResult } from "./parameterResult";
import { MicroType } from "./microType";
import { getTrackedMicroTypes } from "./trackedMicroTypes";

export class MicroInteraction {

    id: number;
    groupId: number;
    type: string | null; // i.e. 'Greeter', 'Farewell'
    parameters: Parameter[] = [];
    parameterResults: ParameterResult[] = [];  
    //Note: results are stored as follows: {parameter id: resultString} (or list instead of result string case of type=array) so parameterResults looks like [{0,"yes"},{20,"option1"}] --these will be passed to backend along with the variable name(which is stored in parameter)

    constructor(id: number = -1, groupId: number = -1, type: string = '', parameters: Parameter[] = [], parameterResults: ParameterResult[] = []) { //micros are built off a microType defined
        this.id = id;
        this.groupId = groupId;
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

    setMircoFromXML(el: Element, id: number) {

      let trackedMicroTypes: MicroType[] = getTrackedMicroTypes();

      // Set micro properties
      this.id = id;

      this.type = el.getElementsByTagName("name")[0].textContent;

      // Set parameters based on trackedMicroTypes

      let curMicroType: MicroType | undefined = trackedMicroTypes.find((m: MicroType) => m.type === this.type);

      if (curMicroType) {
        this.parameters = curMicroType.parameters;
      }

      // Get parameter results
      let parameterResults = el.getElementsByTagName("parameter");

      for (let pid = 0; pid < parameterResults.length; pid++) {
        let pr: ParameterResult = new ParameterResult();
        pr.setParameterResultFromXML(parameterResults[pid], pid);
      }
    }

    getMicroFromXML(): string {
      let trackedMicroTypes: MicroType[] = getTrackedMicroTypes();

      let xmlString: string = '';

      xmlString += '<micro id="' + this.id + '">';
      xmlString += '<name>' + this.type + '</name>';

      console.log(this);

      let microType: MicroType | undefined = trackedMicroTypes.find(mt => mt.type == this.type);

      // Have to get a way to get both param and paramRes synched up for access

      this.parameterResults.forEach((paramRes: ParameterResult) => {

        //let param: Parameter = 
        //xmlString += paramRes.getParameterResultInXML();
      });

      xmlString += '</micro>';

      return xmlString;
    }

    updateResults(results: ParameterResult[]) {
        this.parameterResults = results;
    }
}
