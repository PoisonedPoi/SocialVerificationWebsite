
export class Transition {
    
    id: number;
    firstGroupId: number;
    secondGroupId: number;
    ready: boolean;
    notReady: boolean;

    constructor(
        id: number = -1,
        firstGroup: number = -1,
        secondGroup: number = -1,
        ready: boolean = false,
        notReady: boolean = false
    ) {
        this.id = id;
        this.firstGroupId = firstGroup;
        this.secondGroupId = secondGroup;
        this.ready = ready;
        this.notReady = notReady;
    }
}
