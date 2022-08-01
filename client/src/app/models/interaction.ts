import { Group } from "./group";
import { MicroInteraction } from "./microInteraction";
import { MicroType } from "./microType";
import { ParameterResult } from "./parameterResult";
import { State } from "./state";
import { Transition } from "./transition";
import { Violation } from "./violation";
import { getTrackedMicroTypes } from "./trackedMicroTypes";

export class Interaction {

    groupIdCounter: number = 0;
    transitionIDNum: number = 0;
    microIDNum: number = 0;
    violations: Violation[] = [];
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
        let groups = xmlDoc.getElementsByTagName("group");

        // Iterate over groups and set group properties
        for (let gid = 0; gid < groups.length; gid++) {

          let group: Group = new Group();
          group.setGroupFromXML(groups[gid], gid);

          this.groups.push(group);
        }

        this.groupIdCounter = this.groups.length;

        /*
        let transitions = xmlDoc.getElementsByTagName("transition");

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
        */

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

                console.log(micro);

                micro.parameters.forEach(parameter => {

                  let paramRes = micro.parameterResults.find((x: ParameterResult) => x.id == parameter.id)

                  // Guards to catch parse errors
                  if (!paramRes) {
                    console.log("ERROR: something went wrong!");
                    xmlString += '</parameter>'
                    return;
                  }

                  if (!paramRes.boolResult ||
                      !paramRes.intResult ||
                      !paramRes.strResult ||
                      !paramRes.arrayResult
                  ) {
                    console.log("ERROR: empty parameter");
                    xmlString += '</parameter>'
                    return;
                  }
                  
                  // Clean this up; maybe with a bigger switch statement
                  if (parameter.type == "array") { //unique case
                      xmlString += '<parameter type="array">';
                      xmlString += '<name>answers robot can recognize</name>'

                      paramRes.arrayResult.forEach((res: any) => {
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
                    xmlString += '<parameter type="' + parameter.type + '"';

                    switch (parameter.type) {
                      case 'bool': 
                        xmlString += ' val="' + paramRes.boolResult + '">' ;
                        break;
                      case 'int':
                        xmlString += ' val="' + paramRes.intResult + '">';
                        break;
                      case 'str':
                        xmlString += ' val="' + paramRes.strResult + '">';
                        break;
                    }

                    xmlString += parameter.variableName + '</parameter>';
                  }
                });
                xmlString += '</micro>';
            });
            xmlString += '</group>';
        });

        /*
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

        */

        xmlString += '<design>copy</design>';
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
      let trackedMicroTypes: MicroType[] = getTrackedMicroTypes();

        for (let i = 0; i < trackedMicroTypes.length; i++) {
            if (trackedMicroTypes[i].type == name) {
                //make a deep copy and then return it
                let copiedMicroType = JSON.parse(JSON.stringify(trackedMicroTypes[i]));
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
