import { Group } from "./group";
import { State } from "./state";

export class Transition {
    
    firstGroup: Group;
    secondGroup: Group;
    state: State;
    id: string;

    constructor(
        id: string,
        firstGroup: Group,
        secondGroup: Group
    ) {
        this.firstGroup = firstGroup;
        this.secondGroup = secondGroup;
        this.state = new State();
        this.id = id;
    }
}