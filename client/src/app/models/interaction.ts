import { Group } from "./group";
import { MicroInteraction } from "./microInteraction";
import { MicroType } from "./microType";
import { Parameter } from "./parameter";
import { ParameterResult } from "./parameterResult";
import { Transition } from "./transition";
import { Violation } from "./violation";

export class Interaction {

    groupIDNum: number;
    transitionIDNum: number;
    microIDNum: number;
    violations: Violation[] = [];
    trackedMicroTypes: MicroType[] = [];
    groups: Group[] = [];
    transitions: Transition[] = [];
    micros: MicroInteraction[] = [];

    constructor() {
        this.groupIDNum = 0;
        this.transitionIDNum = 0;
        this.microIDNum = 0;
        this.violations = []
        this.trackedMicroTypes = [];
        this.groups = [];
        this.transitions = [];
        this.micros = [];
    }

    getMicro(id: string): MicroInteraction | null {
        for (let i = 0; i < this.micros.length; i++) {
            if (this.micros[i].id == id) {
                return this.micros[i];
            }
        }

        console.log("ERROR: Model couldnt find getMicro with id " + id);
        return null;
    }

    getMicroParameters(id: string): Parameter[] {
        let ret: MicroInteraction | null = this.getMicro(id); 

        return ret != null ? ret.parameters : [];
    }

    setMicroResults(id: string, results: ParameterResult<any>[]) {
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
            xmlString += '<group id="' + group.id + '" init="' + group.initialGroup + '" x="' + group.x + '" y="' + group.y + '">';
            xmlString += '<name>' + group.name + '</name>';
            group.micros.forEach(micro => {
                xmlString += '<micro>';
                xmlString += '<name>' + micro.type + '</name>';
                micro.parameters.forEach(parameter => {
                    if (parameter.type == "array") { //unique case
                        xmlString += '<parameter type="array">';
                        xmlString += '<name>answers robot can recognize</name>'
                        if (micro && micro.parameterResults && micro.parameterResults.find(x => x.paramID == parameter.id).curResult == '') {
                            xmlString += '</parameter>'
                            return;
                        }
                        micro.parameterResults.find(x => x.paramID == parameter.id).curResult.forEach(res => {
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
                        xmlString += '<parameter type="' + parameter.type + '" val="' + micro.parameterResults.find(x => x.paramID == parameter.id).curResult + '">' + parameter.variableName + '</parameter>';
                    }
                });
                xmlString += '</micro>';
            });
            xmlString += '</group>';
        });

        //add transitions
        JSONModel.transitions.forEach(transition => {
            xmlString += '<transition>'
            xmlString += '<source ref="' + transition.firstGroup.id + '"/>';
            xmlString += '<target ref="' + transition.secondGroup.id + '"/>';
            if (transition.state.ready == true) {
                xmlString += '<guard condition="human_ready"/>';
            }
            if (transition.state.busy == true) {
                xmlString += '<guard condition="human_busy"/>';
            }
            if (transition.state.suspended == true) {
                xmlString += '<guard condition="human_ignore"/>';  //variable name needed in back end
            }
            xmlString += '</transition>'
        });
        xmlString += '<design>copy</design>';
        xmlString += '</nta>';
        return xmlString;
    }

    addViolation(violation) {
        this.violations.push(violation);
    }

    setViolations(violations) {
        this.violations = violations;
    }

    getViolations() {
        return this.violations;
    }

    setMicroParamValByVariable(microID, variableName, val) {
        let micro = this.getMicro(microID);
        let paramID = null
        micro.parameters.forEach(param => {
            if (param.variableName == variableName) {
                paramID = param.id;
            }
        })
        if (paramID == null) {
            console.log("Error, unable to set micro param val by variable, Variable name " + variableName + " not found");
            return
        }
        micro.parameterResults.find(x => x.paramID == paramID).curResult = val;

    }

    loadMicroTypes(newMicroTypes) {
        for (let i = 0; i < newMicroTypes.length; i++) {
            this.trackedMicroTypes.push(newMicroTypes[i]);
        }
    }

    createGroup() {
        let newGroup;
        if (this.groupIDNum == 0) {
            newGroup = new Group(0, true);
        } else {
            newGroup = new Group(this.groupIDNum, false);
        }
        newGroup.name = "untitled" + this.groupIDNum;
        this.groups.push(newGroup);
        this.groupIDNum++;
        return newGroup.id;
    }

    makeGroup(x, y, id, isInitial, name) { //mainly used when loading interactions
        this.groupIDNum = parseInt(this.groupIDNum) + parseInt(id); //simple way to make sure id isn't repeated when dynamically adding groups
        console.log("updated " + this.groupIDNum);
        let newGroup = new Group(id, isInitial);
        newGroup.name = name;
        newGroup.setXY(x, y);
        this.groups.push(newGroup);
        return id;
    }


    getGroup(id) {
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
            if (this.groups[i].initialGroup == true) {
                return this.groups[i];
            }
        }
        console.log("couldnt find id " + id + " in getGroup");
        return;
    }


    setGroupXY(id, x, y) {
        this.getGroup(id).setXY(x, y);
    }


    removeGroup(id) {
        let removeGroup = this.getGroup(id);
        for (let i = 0; i < this.groups.length; i++) {
            if (this.groups[i].id == id) {
                if (this.groups[i].initialGroup == true) {
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

    setTransitionState(id, transitionState) {
        for (let i = 0; i < this.transitions.length; i++) {
            if (this.transitions[i].id == id) {
                this.transitions[i].state = transitionState;
            }
        }
    }

    getTransitionState(id) {
        for (let i = 0; i < this.transitions.length; i++) {
            if (this.transitions[i].id == id) {
                return this.transitions[i].state;
            }
        }
        console.log("Error: getTransitionState ID " + id + " is not found");
    }

    getMicroTypeByName(name) {
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

    addMicroToGroup(id, microTypeName) {
        let group = this.getGroup(id);
        let microType = this.getMicroTypeByName(microTypeName);
        let newMicro = new MicroInteraction(this.microIDNum, microType);
        this.micros.push(newMicro);
        group.addMicro(newMicro);
        this.microIDNum++;
        return newMicro.id;
    }

    removeMicroFromGroup(groupid, microid) {
        let group = this.getGroup(groupid);
        for (let i = 0; i < this.micros.length; i++) {
            if (this.micros[i].id == microid) {
                this.micros.splice(i, 1);
            }
        }
        group.removeMicro(microid);
    }

    addTransition(group1id, group2id) {
        let group1 = this.getGroup(group1id);
        let group2 = this.getGroup(group2id);
        //check for an existing transition between these two groups, there should only be on transition between two specific groups
        for (let i = 0; i < this.transitions.length; i++) {
            if (this.transitions[i].firstGroup == group1 && this.transitions[i].secondGroup == group2) {
                console.error("Transition already exists")
                return -1; //error
            }
        }
        let newTransition = new Transition(this.transitionIDNum, group1, group2);
        this.transitions.push(newTransition);
        this.transitionIDNum++;
        return newTransition.id;
    }

    removeTransition(id) {
        for (let i = 0; i < this.transitions.length; i++) {
            if (this.transitions[i].id == id) {
                this.transitions.splice(i, 1);
                return;
            }
        }
    }

}
