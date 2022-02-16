
//transition states enums   //human ready is hReady
//note, human states are ready, busy and suspended, a transition can have one or all of these states as a condition to switch
const hReady = Symbol("hready");
const hReadyBusy = Symbol("hreadybusy");
const hReadyBusySusp = Symbol("hreadybusysuspended");
const hReadySusp = Symbol("hreadysuspended");
const hBusy = Symbol("hbusy");
const hBusySusp = Symbol("hbusysuspended");
const hSusp = Symbol("hsuspended");






// model classes

class Interaction {
    /*
    errors;
    trackedMicroTypes = [];
    groups = [];
    transitions = [];

    //these only get incremented and serve as unique id
    numGroups;
    numMicros;
    microIDNum;
*/
    constructor(){
        this.groupIDNum = 0;
        this.transitionIDNum = 0;
        this.microIDNum = 0;
        this.errors = new Errors();
        this.trackedMicroTypes = [];
        this.groups = [];
        this.transitions = [];
        this.micros = [];   
    }

    getMicro(id){
        for(let i=0;i<this.micros.length;i++){
            if(this.micros[i].id == id){
                return this.micros[i];
            }
        }
        console.log("ERROR: Model couldnt find getMicro with id " + id);
    }

    getMicroParameters(id){
        return this.getMicro(id).parameters;
    }

    setMicroResults(id, results){
        let micro = this.getMicro(id);
        micro.updateResults(results);
    }

    exportModelToJSON(){
        return(JSON.parse(JSON.stringify(this)));
    }

    addErrors(){
        //todo figure out how to add in errors
    }

    loadMicroTypes(newMicroTypes){
        //TODO load all micro types automatically by controller
        for(let i=0;i< newMicroTypes.length;i++){
            this.trackedMicroTypes.push(newMicroTypes[i]);
        }
    }

    createGroup(){
        let newGroup;
        if (this.groupIDNum === 0){
            newGroup = new Group(0, true);
        }else{
            newGroup = new Group(this.groupIDNum, false); 
        }
        newGroup.name = "untitled" + this.groupIDNum;
        this.groups.push(newGroup);
        this.groupIDNum++;
        return newGroup.id;
    }
    

    getGroup(id){
        for (let i = 0; i < this.groupIDNum;i++){
            if(this.groups[i].id == id){
                return this.groups[i];
            }
        }
        console.log("couldnt find id " + id + " in getGroup");
        return;
    }


    removeGroup(id){
        let removeGroup = this.getGroup(id);
        for (let i = 0; i < this.groups.length; i++) {
            if (this.groups[i].id == id) {
                if(this.groups[i].initialGroup == true){
                    console.log("cannot remove initial group, no change to database TODO make this an error message"); 
                    return false;
                }

                this.groups.splice(i, 1);
                break;
            }
        }
        let toRemove = [];
        for(let i=0;i<this.transitions.length;i++){
            if(this.transitions[i].firstGroup.id == id || this.transitions[i].secondGroup.id == id){
                toRemove.push(this.transitions[i].id);
            }
        }
        for(let i=0;i<toRemove.length;i++){
            this.removeTransition(toRemove[i]);
        }

        let microsToRemove = removeGroup.getMicros();
        for (let i = 0; i < this.micros.length; i++) {
            for(let j=0;j<microsToRemove.length;j++){
                if(this.micros[i].id == microsToRemove[j].id){
                    this.micros.splice(i, 1);
                }   
            }
        }
        return true;
    }

    setTransitionState(id, transitionState){
        for (let i = 0; i < this.transitions.length; i++) {
            if (this.transitions[i].id == id) {
                this.transitions[i].state = transitionState;
            }
        }
    }

    getTransitionState(id){
        for(let i=0;i<this.transitions.length;i++){
            if(this.transitions[i].id == id){
                return this.transitions[i].state;
            }
        }
        console.log("Error: getTransitionState ID " + id + " is not found");
    }

    getMicroTypeByName(name){
        for(let i = 0; i< this.trackedMicroTypes.length;i++){
            if(this.trackedMicroTypes[i].type == name){
                //make a deep copy and then return it
                let copiedMicroType = JSON.parse(JSON.stringify(this.trackedMicroTypes[i]));
                return copiedMicroType;
            }
        }
        console.log("Micro type name " + name + " was not found, it must be loaded into interaction");
        return null;
    }

    addMicroToGroup(id, microTypeName){
        let group = this.getGroup(id);
        let microType = this.getMicroTypeByName(microTypeName);
        let newMicro = new MicroInteraction(this.microIDNum, microType);
        this.micros.push(newMicro);
        group.addMicro(newMicro);
        this.microIDNum++;
        return newMicro.id;
    }

    

    removeMicroFromGroup(groupid, microid){
        let group = this.getGroup(groupid);
        for(let i=0;i<this.micros.length;i++){
            if(this.micros[i].id== microid){
                this.micros.splice(i, 1);
            }
        }
        group.removeMicro(microid);
    }

    addTransition(group1id, group2id){
        let group1 = this.getGroup(group1id);
        let group2 = this.getGroup(group2id);
        let newTransition = new Transition(this.transitionIDNum, group1, group2);
        this.transitions.push(newTransition);
        this.transitionIDNum++;
        return newTransition.id;
    }

    removeTransition(id){
        for(let i=0;i<this.transitions.length;i++){
            if(this.transitions[i].id === id){
                this.transitions.splice(i, 1);
                return;
            }
        }
    }

}


class Group{
    /*
    initialGroup;
    id;
    name;
    micros = [];
*/
    constructor(id, isFirst){
        this.initialGroup = isFirst;
        this.id = id;
        this.micros = [];
    }

    addMicro(micro){
        this.micros.push(micro);
    }

    removeMicro(microid){
        for (let i = 0; i < this.micros.length; i++) {
            if (this.micros[i].id === microid) {
                this.micros.splice(i, 1);
                return;
            }
        }
    }
    getMicros(){
        return this.micros;
    }

}


class Transition {
    /*
    firstGroup;
    secondGroup;
    state;   Note: states are stored as objects of, { ready: bool, busy: bool, suspended: bool}
    id;
*/
    constructor(id, firstGroup, secondGroup){
        this.firstGroup = firstGroup;
        this.secondGroup = secondGroup;
        this.state= {ready: true, busy: true, suspended: true};
        this.id = id;
    }

}


class MicroInteraction{
    /*
    id;
    type;
    parameters = [];
    parameterResults = [];
    Note: results are stored as follows: {parameter id: resultString} so parameterResults looks like [{0,"yes"},{20,"option1"}]
    */
    constructor(id, microType){ //micros are built off a microType defined
        this.type = microType.type;
        this.parameters = microType.parameters;
        this.id = id;
        this.parameterResults = [];
    }

    updateResults(results){
        this.parameterResults = results;
    }
}


class MicroType{
    /*
    parameters = [];
    type;
    */
    constructor(type,parameters){
        this.type = type;
        this.parameters = parameters;
    }
    
}


class Parameter {
    /*
    id;
    description;
    field;
    value;
    isBoolean;
    isField;
    isDropDown;
    dropDownSelections = [];
    */
    constructor(id, description, isBoolean, isField, isDropdown, dropDownSelections) { //used to add dropDownSelections
        this.id = id;
        this.description = description;
        this.isBoolean = isBoolean;
        this.isField = isField;
        this.isDropDown = isDropdown;
        this.dropDownSelections = dropDownSelections;//this may be null if not used
    }


}

class Errors {
   // flubs;
    
    constructor(){
        this.flubs = [];
    }

    addFlub(flub){
        this.flubs.push(flub);
    }

    getFlubs(){
        return this.flubs;
    }


}

class Flub{
    /*
    category;
    targetID;
    description;
    */

    constructor(targetID, category, description){
        this.targetID = targetID;
        this.category = category;
        this.description = description;
    }

}

//export {Interaction, Group, Transition, MicroInteraction, MicroType, Parameter };