export class ParameterResult<T> {

    paramId: string;
    currResult: T;

    constructor(id: string, res: T) {
        this.paramId = id;
        this.currResult = res;
    }


}