export class ParameterResult<T> {

    paramId: string;
    currResult: T;
    linkTitle: string = "";
    val: string = "";

    constructor(id: string, res: T) {
        this.paramId = id;
        this.currResult = res;
    }


}
