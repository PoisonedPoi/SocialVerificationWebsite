import { MicroInteraction } from "./microInteraction";
import { Parameter } from "./parameter";

export class Group {

    isInitialGroup: boolean;
    id: number;
    name: string | null = "";
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
      this.id = id;

      this.isInitialGroup = el.getAttribute("init") == 'true';

      this.x = parseInt(el.getAttribute("x")!);
      this.y = parseInt(el.getAttribute("y")!);

      this.name = el.getElementsByTagName("name")[0].textContent;

      // Load micros
      let micros = el.getElementsByTagName("micro");

      let mid;
      for (mid = 0; mid < micros.length; mid++) {

        let micro: MicroInteraction = new MicroInteraction();

        this.micros.push(micro);
      }

      this.microIdCounter = mid;

    }

    /* Export group to XML */

    getGroupInXML(): string {
      let xmlString: string = '';
      xmlString += '<group id="' + this.id + '" init="' + this.isInitialGroup + '" x="' + this.x + '" y="' + this.y + '">';
      xmlString += '<name>' + this.name + '</name>';

      this.micros.forEach((micro: MicroInteraction) => {
      });

      xmlString += '</group>';

      return xmlString;
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

    /*
    setMicroResults(microId: number, results: ParameterResult<any>[]) {
        let micro: MicroInteraction | null = this.getMicro(microId);
        if (micro) {
            micro.updateResults(results);
        }
    }
    */

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
        let paramRes = micro.parameterResults.find(x => x.id == paramID);
        if (paramRes) {
          if (paramRes.type == 'bool') {
            paramRes.boolResult = val;
          } else if (paramRes.type == 'int') {
            paramRes.intResult = val;
          } else if (paramRes.type == 'str') {
            paramRes.strResult = val;
          } else if (paramRes.type == 'array') {
            paramRes.arrayResult = val;
          }
        }

    }
}
