import { MicroInteraction } from "./microInteraction";
import { Parameter } from "./parameter";
import { ParameterResult } from "./parameterResult";
import { MicroType } from "./microType";

export class Group {

    isInitialGroup: boolean;
    id: number;
    name: string = "";
    x: number; 
    y: number;
    micros: MicroInteraction[] = [];
    microIdCounter: number = 0;

    constructor(
      isInitialGroup: boolean = false,
      id: number = -1, 
      name: string = "",
      x: number = 5,
      y: number = 5
    ) {
        this.isInitialGroup = isInitialGroup;
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
        this.micros = [];
    }

    /* Create group from XML element */

    setGroupFromXML(el: Element, id: number) {
      // Set group properties
      // groupId is based on a counter so the index of groups is the ID

      let isInitial: boolean = el.getAttribute("init") == 'true';

      let x = parseInt(el.getAttribute("x")!);
      let y = parseInt(el.getAttribute("y")!);

      let name = el.getElementsByTagName("name")[0].textContent;

      let micros = el.getElementsByTagName("micro");
      let groupMicros: MicroInteraction[] = [];

      //load micros
      for (let mid = 0; mid < micros.length; mid++) {

        // Set micro properties
        // Same as groups microIds are based off a counter so index of micros is the ID

        let type = micros[mid].getElementsByTagName("name")[0].textContent;

        //load saved values of micro into group
        let parameterResults = micros[mid].getElementsByTagName("parameter");

        // These are the parameter results
        let microParameterResults: ParameterResult<any>[] = [];

        for (let pid = 0; pid < parameterResults.length; pid++) {

          // Setup parameters
          let curParameter = parameterResults[pid];
          let curType = curParameter.getAttribute("type");

          if (curType == "array") {
              let arrayItems = curParameter.getElementsByTagName('item');
              let arrayVariable = curParameter.getElementsByTagName('name')[0].textContent;
              let arrayResults = [];
              for (let m = 0; m < arrayItems.length; m++) {
                  let curItem = arrayItems[m];
                  let itemVal = curItem.getAttribute('val');
                  let itemLink = curItem.getAttribute('link');
                  if (itemLink == 'human_ready') {
                      itemLink = 'Human Ready';
                  } else if (itemLink == 'human_ignore') {
                      itemLink = 'Human Suspended';
                  }
                  arrayResults.push({ val: itemVal, linkTitle: itemLink });
              }
              microParameterResults.push(new ParameterResult<any>(pid, arrayResults));
              //IC.interaction.setMicroParamValByVariable(microID, arrayVariable, arrayResults);

          } else {
              let curVal = curParameter.getAttribute("val");
              let paramVariable = curParameter.textContent;
              microParameterResults.push(new ParameterResult<any>(pid, curVal));
              //IC.interaction.setMicroParamValByVariable(microID, paramVariable, curVal);
          }
        }

        //load template of micro into group
        let microParameters: Parameter[] = [];

        let curMicroType: MicroType | undefined = this.trackedMicroTypes.find((m: MicroType) => m.type === type);

        if (curMicroType) {
          microParameters = curMicroType.parameters;
        }

        groupMicros.push(new MicroInteraction(mid, id, type!, microParameters, microParameterResults));
      }
    }

    
    /* Position */

    setXY(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /* Microinteraction Management */

    removeMicro(microid: number) {
        for (let i = 0; i < this.micros.length; i++) {
            if (this.micros[i].id == microid) {
                this.micros.splice(i, 1);
                return;
            }
        }
        console.log("ERROR: did not find and remove micro " + microid + " from group " + this.id)
    }

    getMicros() {
        return this.micros;
    }
  
    getMicro(microId: number): MicroInteraction | null {
      for (let i = 0; i < this.micros.length; i++) {
          if (this.micros[i].id == microId) {
              return this.micros[i];
          }
      }

      console.log("ERROR: Model couldnt find getMicro with microId " + microId);
      return null;
    }

    getMicroParameters(microId: number): Parameter[] {
        let ret: MicroInteraction | null = this.getMicro(microId);

        return ret != null ? ret.parameters : [];
    }

    setMicroResults(microId: number, results: ParameterResult<any>[]) {
        let micro: MicroInteraction | null = this.getMicro(microId);
        if (micro) {
            micro.updateResults(results);
        }
    }

    setMicroParamValByVariable(microID: number, variableName: string, val: any) {
        let micro = this.getMicro(microID);
        if (!micro) { return; }

        let paramID: number = -1;
        micro.parameters.forEach(param => {
            if (param.variableName == variableName) {
                paramID = param.id;
            }
        })
        if (paramID == null) {
            console.log("ERROR: unable to set micro param val by variable, Variable name " + variableName + " not found");
            return;
        }
        let paramRes = micro.parameterResults.find(x => x.paramId == paramID);
        if (paramRes) {
            paramRes.currResult = val;
        }

    }
}
