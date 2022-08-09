import { State } from "./state";

export class Transition {
    
    firstGroupId: number;
    secondGroupId: number;
    state: State;
    id: number;

    constructor(
        id: number = -1,
        firstGroup: number = -1,
        secondGroup: number = -1
    ) {
        this.firstGroupId = firstGroup;
        this.secondGroupId = secondGroup;
        this.state = new State();
        this.id = id;
    }
}
