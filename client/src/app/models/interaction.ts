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
    //micros: MicroInteraction[] = [];

    constructor(xml: string | null = null) {
        if (xml) {
            this.createFromXML(xml);
        }
    }

    createFromXML(xml: string) {
      let parser: DOMParser = new DOMParser();
      let xmlDoc: Document = parser.parseFromString(xml, "text/xml");;

      const errorNode = xmlDoc.querySelector('parsererror');
      if (errorNode) {
        console.log("Parsing error");
        return;
      } else {
        this.loadMicroTypes()

        let groups = xmlDoc.getElementsByTagName("group");
        let transitions = xmlDoc.getElementsByTagName("transition");

        for (let i = 0; i < groups.length; i++) {
            let curGroup = groups[i];

            let groupIDStr = curGroup.getAttribute("id");
            let groupID = parseInt(groupIDStr!);

            let isInitialGroup = curGroup.getAttribute("init");
            let isInitial: boolean = false;

            if (isInitialGroup == "true") {
                isInitial = true;
            } else {
                isInitial = false;
            }

            let xStr = curGroup.getAttribute("x");
            let yStr = curGroup.getAttribute("y");

            let x = parseInt(xStr!);
            let y = parseInt(yStr!);

            let name = curGroup.getElementsByTagName("name")[0].textContent;
            //load group
            let g: Group = this.addGroup(x, y, groupID, isInitial, name!);
            let micros = curGroup.getElementsByTagName("micro");
            //load micros
            for (let j = 0; j < micros.length; j++) {

                let curMicro = micros[j];
                let microName = curMicro.getElementsByTagName("name")[0].textContent;
                let microId: string | null = curMicro.getAttribute("id");

                //load saved values of micro into group
                let parameters = curMicro.getElementsByTagName("parameter");
                let microParameters: Parameter[] = [];

                for (let k = 0; k < parameters.length; k++) {
                    let curParameter = parameters[k];
                    let curType = curParameter.getAttribute("type");
                    if (curType == "array") {
                        let arrayItems = curParameter.getElementsByTagName('item');
                        let arrayVariable = curParameter.getElementsByTagName('name')[0].textContent;
                        let arrayResults = [];
                        for (let m = 0; m < arrayItems.length; m++) {
                            let curItem = arrayItems[m];
                            let itemVal = curItem.getAttribute('val');
                            let itemLink = curItem.getAttribute('link');
                            if (itemLink == 'human_ready') {
                                itemLink = 'Human Ready';
                            } else if (itemLink == 'human_ignore') {
                                itemLink = 'Human Suspended';
                            }
                            arrayResults.push({ val: itemVal, linkTitle: itemLink });
                        }
                        //IC.interaction.setMicroParamValByVariable(microID, arrayVariable, arrayResults);

                    } else {
                        let curVal = curParameter.getAttribute("val");
                        let paramVariable = curParameter.textContent;
                        //IC.interaction.setMicroParamValByVariable(microID, paramVariable, curVal);
                    }
                }

                //load template of micro into group
                if (microId) {
                  g.micros.push(new MicroInteraction(parseInt(microId), microName!, microParameters));
                }
            }
        }
        for (let i = 0; i < transitions.length; i++) {
            let curTransition = transitions[i];
            let group1ID = curTransition.getElementsByTagName("source")[0].getAttribute("ref");
            let group2ID = curTransition.getElementsByTagName("target")[0].getAttribute("ref");
            let guards = curTransition.getElementsByTagName("guard");
            let humanReady = false;
            let humanBusy = false;
            let humanIgnored = false;
            for (let j = 0; j < guards.length; j++) {
                let curGuard = guards[j];
                if (curGuard.getAttribute("condition") == "human_ready") {
                    humanReady = true;
                } else if (curGuard.getAttribute("condition") == "human_busy") {
                    humanBusy = true;
                } else if (curGuard.getAttribute("condition") == "human_ignore") {
                    humanIgnored = true;
                }
            }
            //let newTransID = addTransitionByID(group1ID, group2ID);
            //updateTransitionStates(newTransID, humanReady, humanBusy, humanIgnored);
        }

        this.groupIdCounter = this.groups.length;
      }
    }


    exportModelToJSON() {
        return (JSON.parse(JSON.stringify(this)));
    }

    exportModelToXML() {
        let JSONModel = JSON.parse(JSON.stringify(this));
        //let xmlString = '<?xml version="1.0" encoding="UTF-8" ?>';
        let xmlString = '<nat>'
        //xmlString += '<interaction>';
        xmlString += '<name>interaction</name>';

        //add groups
        JSONModel.groups.forEach((group: Group) => {
            xmlString += '<group id="' + group.id + '" init="' + group.isInitialGroup + '" x="' + group.x + '" y="' + group.y + '">';
            xmlString += '<name>' + group.name + '</name>';
            group.micros.forEach((micro: MicroInteraction) => {
                xmlString += '<micro id="' + micro.id + '">';
                xmlString += '<name>' + micro.type + '</name>';
                micro.parameters.forEach(parameter => {
                    if (parameter.type == "array") { //unique case
                        xmlString += '<parameter type="array">';
                        xmlString += '<name>answers robot can recognize</name>'

                        let paramRes = micro.parameterResults.find((x: ParameterResult<any>) => x.paramId == parameter.id)

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
        //xmlString += '</interaction>';
        xmlString += '</nat>';
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


    loadMicroTypes() {
        //TODO access serverlet to get all microinteraction types from server and store them as micro types, for now these are the hard coded versions
        let microTypes = [];

        //greeter
        let parameter0 = new Parameter(0, "Wait for Response", "Wait_for_response", "Set whether the robot waits for the human to greet back", "bool");
        let parameter1 = new Parameter(1, "Greet with Speech", "Greet_with_speech", "Set whether the robot greets the human with speech", "bool");
        let parameter2 = new Parameter(2, "Greet with Handshake", "Greet_with_handshake", "Set whether the robot extends its arm for a handshake", "bool");
        let microGreeter = new MicroType("Greeter", [parameter0, parameter1, parameter2]);
        microTypes.push(microGreeter);

        //ask
        let parameter3 = new Parameter(3, "Question", "question", "The Specific question the robot will ask", "str");
        let parameter4 = new Parameter(4, "Responses the robot can recognize", "answers robot can recognize", "input the answers the robot can recognize the user saying, and then set the state that should be executed following the response", "array");
        let microAsk = new MicroType("Ask", [parameter3, parameter4]);
        microTypes.push(microAsk);

        //remark
        let parameter5 = new Parameter(5, "Content", "content", "What the robot will say to the user", "str");
        let parameter6 = new Parameter(6, "Use Gesture", "use_gesture", "Should the robot use gestures (this is different from handoff)", "bool");
        let parameter7 = new Parameter(7, "Allow the human to respond", "Allow_human_to_respond", "Whether the robot gives the human any time to respond after the robot's remark before moving on", "bool");
        let microRemark = new MicroType("Remark", [parameter5, parameter6, parameter7]);
        microTypes.push(microRemark);

        //instruction
        let parameter8 = new Parameter(8, "Instruction", "Instruction", "The instruction that the robot will provide the human", "str");
        let microInstruct = new MicroType("Instruction", [parameter8]);
        microTypes.push(microInstruct);

        //handoff
        let microHandoff = new MicroType("Handoff", []);
        microTypes.push(microHandoff);

        //answer
        let parameter9 = new Parameter(9, "Introduction", "Introduction", "Robot begins microinteraction by saying I can answer your question", "bool");
        let microAnswer = new MicroType("Answer", [parameter9]);
        microTypes.push(microAnswer);

        //wait
        let parameter10 = new Parameter(10, "Wait Time (seconds)", "wait time (seconds)", "Number of seconds for the robot to wait", "int");
        let parameter11 = new Parameter(11, "Allow Speech", "allow_speech", "Allows a human to say something to the robot to override its wait time", "bool");
        let parameter12 = new Parameter(12, "Look At People", "look_at_people", "Enable face tracking, which allows the robot to met the gaze of anyone in its vicinity", "bool");
        let microWait = new MicroType("Wait", [parameter10, parameter11, parameter12]);
        microTypes.push(microWait);

        //farwell
        let microFarewell = new MicroType("Farewell", []);
        microTypes.push(microFarewell);

        for (let i = 0; i < microTypes.length; i++) {
            this.trackedMicroTypes.push(microTypes[i]);
        }
    }

    addGroup(x: number, y: number, id: number, isInitial: boolean, name: string): Group {
      let group: Group = new Group(isInitial, id, name, x, y);

      this.groups.push(group);

      return group;
    }

    getGroup(id: number) {
        for (let i = 0; i < this.groups.length; i++) {
            if (this.groups[i].id == id) {
                return this.groups[i];
            }
        }
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

        if (!removeGroup) { return; }

        for (let i = 0; i < this.groups.length; i++) {
            if (this.groups[i].id == id) {
                if (this.groups[i].isInitialGroup == true && this.groups.length != 1) {
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
        console.trace();
        return null;
    }

    /*
    addMicroToGroup(id: number, microTypeName: string) {
        let group = this.getGroup(id);
        let microType = this.getMicroTypeByName(microTypeName);
        //let newMicro = new MicroInteraction(this.microIDNum, microType);
        let newMicro = new MicroInteraction(1, microTypeName);
        this.micros.push(newMicro);

        if (!group) { return; }

        group.micros.push(newMicro);
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
    */

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
