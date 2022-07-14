import { Group } from "./group";
import { State } from "./state";

export class Transition {
    
    firstGroup: Group;
    secondGroup: Group;
    state: State;
    id: number;

    constructor(
        id: number,
        firstGroup: Group,
        secondGroup: Group
    ) {
        this.firstGroup = firstGroup;
        this.secondGroup = secondGroup;
        this.state = new State();
        this.id = id;
    }
}