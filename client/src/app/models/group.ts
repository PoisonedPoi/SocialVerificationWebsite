import { MicroInteraction } from "./microInteraction";

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

    setXY(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    removeMicro(microid: number) {
        for (let i = 0; i < this.micros.length; i++) {
            if (this.micros[i].id == microid) {
                this.micros.splice(i, 1);
                return;
            }
        }
        console.log("error, did not find and remove micro " + microid + " from group " + this.id)
    }
    getMicros() {
        return this.micros;
    }
}
