
export class Transition {
    
    id: number;
    firstMicroId: number;
    secondMicroId: number;
    ready: boolean;
    notReady: boolean;

    constructor(
        id: number = -1,
        firstMicro: number = -1,
        secondMicro: number = -1,
        ready: boolean = false,
        notReady: boolean = false
    ) {
        this.id = id;
        this.firstMicroId = firstMicro;
        this.secondMicroId = secondMicro;
        this.ready = ready;
        this.notReady = notReady;
    }
}
