import { Parameter } from "./parameter";

export class MicroType {

    parameters: Parameter[] | []; 
    type: string;

    constructor(type: string = 'Greeter', parameters: Parameter[] | [] = []) {
        this.type = type;
        this.parameters = parameters;
    }
}
