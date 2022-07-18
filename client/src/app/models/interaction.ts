import { Group } from "./group";
import { MicroInteraction } from "./microInteraction";
import { MicroType } from "./microType";
import { Parameter } from "./parameter";
import { ParameterResult } from "./parameterResult";
import { State } from "./state";
import { Transition } from "./transition";
import { Violation } from "./violation";

export class Interaction {

    groupIdCounter: number = 0;
    transitionIDNum: number = 0;
    microIDNum: number = 0;
    violations: Violation[] = [];
    trackedMicroTypes: MicroType[] = [];
    groups: Group[] = [];
    transitions: Transition[] = [];
    micros: MicroInteraction[] = [];

    constructor(xml: string | null = null) {
        if (xml) {
            this.createFromXML(xml);
        }
    }

    createFromXML(xml: string) {

    }

    getMicro(id: number): MicroInteraction | null {
        for (let i = 0; i < this.micros.length; i++) {
            if (this.micros[i].id == id) {
                return this.micros[i];
            }
        }

        console.log("ERROR: Model couldnt find getMicro with id " + id);
        return null;
    }

    getMicroParameters(id: number): Parameter[] {
        let ret: MicroInteraction | null = this.getMicro(id);

        return ret != null ? ret.parameters : [];
    }

    setMicroResults(id: number, results: ParameterResult<any>[]) {
        let micro: MicroInteraction | null = this.getMicro(id);
        if (micro) {
            micro.updateResults(results);
        }
    }

    exportModelToJSON() {
        return (JSON.parse(JSON.stringify(this)));
    }

    exportModelToXML() {
        let JSONModel = JSON.parse(JSON.stringify(this));
        let xmlString = '';
        //xmlString += '<?xml version="1.0" encoding="utf-8"?>'
        xmlString += '<nta>';
        xmlString += '<name>interaction</name>';

        //add groups
        JSONModel.groups.forEach((group: Group) => {
            xmlString += '<group id="' + group.id + '" init="' + group.isInitialGroup + '" x="' + group.x + '" y="' + group.y + '">';
            xmlString += '<name>' + group.name + '</name>';
            group.micros.forEach(micro => {
                xmlString += '<micro>';
                xmlString += '<name>' + micro.type + '</name>';
                micro.parameters.forEach(parameter => {
                    if (parameter.type == "array") { //unique case
                        xmlString += '<parameter type="array">';
                        xmlString += '<name>answers robot can recognize</name>'

                        let paramRes = micro.parameterResults.find(x => x.paramId == parameter.id)

                        if (!paramRes) {
                            console.log("ERROR: something went wrong!");
                            xmlString += '</parameter>'
                            return;
                        }

                        if (paramRes.currResult == '') {
                            xmlString += '</parameter>'
                            return;
                        }

                        paramRes.currResult.forEach((res: any) => {
                            let link = "";
                            if (res.linkTitle == "Human Ready") {
                                link = "human_ready";  //these are the variables needed in the back end
                            } else if (res.linkTitle == "Human Suspended") {
                                link = "human_ignore";
                            } else {
                                console.log("ERROR: interaction.exportModelToXML: linkTitle not recognized when making model");
                            }
                            xmlString += '<item type="string" val="' + res.val + '" link="' + link + '"/>';
                        });
                        xmlString += '</parameter>'
                    } else { //normal case

                        let paramRes = micro.parameterResults.find(x => x.paramId == parameter.id)

                        if (!paramRes) {
                            console.log("ERROR: something went wrong!");
                            xmlString += '</parameter>'
                            return;
                        }
                        xmlString += '<parameter type="' + parameter.type + '" val="' + paramRes.currResult + '">' + parameter.variableName + '</parameter>';
                    }
                });
                xmlString += '</micro>';
            });
            xmlString += '</group>';
        });

        //add transitions
        JSONModel.transitions.forEach((transition: Transition) => {
            xmlString += '<transition>'
            xmlString += '<source ref="' + transition.firstGroup.id + '"/>';
            xmlString += '<target ref="' + transition.secondGroup.id + '"/>';
            if (transition.state.isReady == true) {
                xmlString += '<guard condition="human_ready"/>';
            }
            if (transition.state.isBusy == true) {
                xmlString += '<guard condition="human_busy"/>';
            }
            if (transition.state.isSuspended == true) {
                xmlString += '<guard condition="human_ignore"/>';  //variable name needed in back end
            }
            xmlString += '</transition>'
        });
        xmlString += '<design>copy</design>';
        xmlString += '</nta>';
        return xmlString;
    }

    addViolation(violation: Violation) {
        this.violations.push(violation);
    }

    setViolations(violations: Violation[]) {
        this.violations = violations;
    }

    getViolations() {
        return this.violations;
    }

    setMicroParamValByVariable(microID: number, variableName: string, val: any) {
        let micro = this.getMicro(microID);
        if (!micro) { return; }

        let paramID: string = '';
        micro.parameters.forEach(param => {
            if (param.variableName == variableName) {
                paramID = param.id;
            }
        })
        if (paramID == null) {
            console.log("Error, unable to set micro param val by variable, Variable name " + variableName + " not found");
            return;
        }
        let paramRes = micro.parameterResults.find(x => x.paramId == paramID);
        if (paramRes) {
            paramRes.currResult = val;
        }

    }

    loadMicroTypes(newMicroTypes: MicroType[]) {
        for (let i = 0; i < newMicroTypes.length; i++) {
            this.trackedMicroTypes.push(newMicroTypes[i]);
        }
    }

    addGroup(x: number, y: number, id: number, isInitial: boolean, name: string): Group {
      let group: Group = new Group(isInitial, id, name, x, y);

      this.groups.push(group);

      return group;
    }

    /*
    // Creates a group
    createGroup(): Group {
        let newGroup;
        if (this.groupIDNum == 0) {
            //newGroup = new Group(true);
        } else {
            //newGroup = new Group(this.groupIDNum, false);
        }
        newGroup.name = "untitled" + this.groupIDNum;
        this.groups.push(newGroup);
        this.groupIDNum++;
        return newGroup;
    }

    makeGroup(x: number, y: number, id: number, isInitial: boolean, name: string) { //mainly used when loading interactions
        this.groupIDNum = this.groupIDNum + id; //simple way to make sure id isn't repeated when dynamically adding groups
        console.log("updated " + this.groupIDNum);
        let newGroup = new Group(id, isInitial);
        newGroup.name = name;
        newGroup.setXY(x, y);
        this.groups.push(newGroup);
        return id;
    }
    */


    getGroup(id: number) {
        //console.log(this.groups);
        for (let i = 0; i < this.groups.length; i++) {
            if (this.groups[i].id == id) {
                return this.groups[i];
            }
        }
        console.log("couldnt find id " + id + " in getGroup");
        return;
    }

    getInitialGroup() {
        for (let i = 0; i < this.groups.length; i++) {
            if (this.groups[i].isInitialGroup == true) {
                return this.groups[i];
            }
        }
        console.log("couldnt find initial group in getGroup");
        return;
    }


    setGroupXY(id: number, x: number, y: number) {
        let g = this.getGroup(id);
        if (g) {
            g.setXY(x, y);
            return;
        }
        console.log("Error here in setGroupXY");
    }


    removeGroup(id: number) {
        let removeGroup = this.getGroup(id);
        for (let i = 0; i < this.groups.length; i++) {
            if (this.groups[i].id == id) {
                if (this.groups[i].isInitialGroup == true) {
                    console.log("cannot remove initial group, no change to database TODO make this an error message");
                    return false;
                }

                this.groups.splice(i, 1);
                break;
            }
        }
        let toRemove = [];
        for (let i = 0; i < this.transitions.length; i++) {
            if (this.transitions[i].firstGroup.id == id || this.transitions[i].secondGroup.id == id) {
                toRemove.push(this.transitions[i].id);
            }
        }
        for (let i = 0; i < toRemove.length; i++) {
            this.removeTransition(toRemove[i]);
        }

        if (!removeGroup) { return; }

        let microsToRemove = removeGroup.getMicros();
        for (let i = 0; i < this.micros.length; i++) {
            for (let j = 0; j < microsToRemove.length; j++) {
                if (this.micros[i].id == microsToRemove[j].id) {
                    this.micros.splice(i, 1);
                }
            }
        }
        return true;
    }

    setTransitionState(id: number, transitionState: State) {
        for (let i = 0; i < this.transitions.length; i++) {
            if (this.transitions[i].id == id) {
                this.transitions[i].state = transitionState;
            }
        }
    }

    getTransitionState(id: number): State {
        for (let i = 0; i < this.transitions.length; i++) {
            if (this.transitions[i].id == id) {
                return this.transitions[i].state;
            }
        }
        console.log("Error: getTransitionState ID " + id + " is not found");
        return new State();
    }

    getMicroTypeByName(name: string) {
        for (let i = 0; i < this.trackedMicroTypes.length; i++) {
            if (this.trackedMicroTypes[i].type == name) {
                //make a deep copy and then return it
                let copiedMicroType = JSON.parse(JSON.stringify(this.trackedMicroTypes[i]));
                return copiedMicroType;
            }
        }
        console.log("Micro type name " + name + " was not found, it must be loaded into interaction");
        return null;
    }

    addMicroToGroup(id: number, microTypeName: string) {
        let group = this.getGroup(id);
        let microType = this.getMicroTypeByName(microTypeName);
        let newMicro = new MicroInteraction(this.microIDNum, microType);
        this.micros.push(newMicro);

        if (!group) { return; }

        group.addMicro(newMicro);
        this.microIDNum++;
        return newMicro.id;
    }

    removeMicroFromGroup(groupid: number, microid: number) {
        let group = this.getGroup(groupid);
        for (let i = 0; i < this.micros.length; i++) {
            if (this.micros[i].id == microid) {
                this.micros.splice(i, 1);
            }
        }

        if (!group) { return; }

        group.removeMicro(microid);
    }

    addTransition(group1id: number, group2id: number) {
        let group1 = this.getGroup(group1id);
        let group2 = this.getGroup(group2id);
        //check for an existing transition between these two groups, there should only be on transition between two specific groups
        for (let i = 0; i < this.transitions.length; i++) {
            if (this.transitions[i].firstGroup == group1 && this.transitions[i].secondGroup == group2) {
                console.error("Transition already exists")
                return -1; //error
            }
        }

        if (!group1 || !group2) { return; }

        let newTransition = new Transition(this.transitionIDNum, group1, group2);
        this.transitions.push(newTransition);
        this.transitionIDNum++;
        return newTransition.id;
    }

    removeTransition(id: number) {
        for (let i = 0; i < this.transitions.length; i++) {
            if (this.transitions[i].id == id) {
                this.transitions.splice(i, 1);
                return;
            }
        }
    }

}
