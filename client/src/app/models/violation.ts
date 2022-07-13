export class Violation {
    category: string;   //-either "group" or "interaction"  --whether this is a group level violation (has associated group) or an interaction level violation (is violated somewhere in the interaction but exact location cant be pinpointed)
    type: string   // -- the type of property being violated
    description: string //--the description of the property being violated
    violatorGroups: string[] = []; //  --[groupName]   list of name of the group (or groups) violating this property, will be empty if category is violation

    constructor(category: string, type: string, description: string) {
        this.category = category;
        this.type = type;
        this.description = description;
        this.violatorGroups = [];
    }

    addGroupViolating(groupName: string) {
        this.violatorGroups.push(groupName);
    }

    setGroupsViolating(groupIDs: string[]) {
        this.violatorGroups = groupIDs;
    }

    getGroupsViolating() {
        return this.violatorGroups;
    }
}