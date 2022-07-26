import { MicroInteraction } from "./microInteraction";
import { Parameter } from "./parameter";
import { ParameterResult } from "./parameterResult";

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
