import { MicroInteraction } from "./microInteraction";

export class Group {

    initialGroup: boolean; //--is this the initial group or no? (bool)
    id: number;
    name?: string;
    x: number; 
    y: number;
    micros: MicroInteraction[] = [];

    constructor(id: number = -1, isFirst: boolean = false) {
        this.initialGroup = isFirst;
        this.id = id;
        this.micros = [];
        this.x = 5;
        this.y = 5;
    }

    setXY(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    addMicro(micro: MicroInteraction) {
        this.micros.push(micro);
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