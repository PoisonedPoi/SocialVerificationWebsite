export class State {
    isReady: boolean;
    isBusy: boolean;
    isSuspended: boolean;

    constructor(
        ready: boolean = true,
        busy: boolean = true,
        suspended: boolean = true
    ) {
        this.isReady = ready;
        this.isBusy = busy;
        this.isSuspended = suspended;
    }
}