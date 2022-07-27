export class Parameter {

    id: number;
    title: string; // the name that will display for this parameter
    variableName: string; // the variable name associated with this parameter as defined in back end
    description: string;
    type: string // one of these: "str", "bool", "array","int" - (these are sent to back end as parameter type)

    constructor(
        id: number = -1, 
        title: string = '',
        variableName: string = '', 
        description: string = '', 
        type: string = ''
    ) {
        this.id = id;
        this.title = title;
        this.variableName = variableName;
        this.description = description;
        this.type = type;
    }
}
