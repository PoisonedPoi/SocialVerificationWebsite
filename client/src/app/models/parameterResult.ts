export class ParameterResult<T> {

    paramId: number;
    currResult: T;
    linkTitle: string = "";
    val: string = "";

    constructor(id: number, res: T) {
        this.paramId = id;
        this.currResult = res;
    }


}
