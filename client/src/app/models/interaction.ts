import { Group } from "./group";
import { MicroType } from "./microType";
import { State } from "./state";
import { Transition } from "./transition";
import { Violation } from "./violation";
import { getTrackedMicroTypes } from "./trackedMicroTypes";

export class Interaction {

    groupIdCounter: number = 0;
    transitionIdCounter: number = 0;
    violations: Violation[] = [];
    groups: Group[] = [];
    transitions: Transition[] = [];

    constructor(json: string | null = null) {
      if (json) {
        let interactionData = JSON.parse(json);

        this.groupIdCounter = interactionData.groupIdCounter;
        this.transitionIdCounter = interactionData.transitionIdCounter;

        this.groups = interactionData.groups;
        this.transitions = interactionData.transitions;
      }
    }

    /* Violations */

    addViolation(violation: Violation) {
        this.violations.push(violation);
    }

    setViolations(violations: Violation[]) {
        this.violations = violations;
    }

    getViolations() {
        return this.violations;
    }

    /* Groups */

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
          /*
            if (this.transitions[i].firstGroup.id == id || this.transitions[i].secondGroup.id == id) {
                toRemove.push(this.transitions[i].id);
            }
            */
        }
        for (let i = 0; i < toRemove.length; i++) {
            //this.removeTransition(toRemove[i]);
        }


        return true;
    }

    /* Transitions */

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

    /*
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
    */

    removeTransition(id: number) {
        for (let i = 0; i < this.transitions.length; i++) {
            if (this.transitions[i].id == id) {
                this.transitions.splice(i, 1);
                return;
            }
        }
    }

    /* Microinteraction types */

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

}
