import { identifierName } from '@angular/compiler';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { Group } from '../models/group';

@Injectable({
  providedIn: 'root'
})
export class CanvasManagerService {

  isAddingGroup: boolean = false;
  addingTransition: number = 0;

  groupIdCounter: number = 0;
  groups: Group[] = [];

  @Output() updateBtnState: EventEmitter<any> = new EventEmitter();
  @Output() getUpdatedGroups: EventEmitter<Group[]> = new EventEmitter<Group[]>();

  constructor() {}

  addGroup(x: number, y: number): number {
    this.groupIdCounter++;

    let g = new Group(this.groupIdCounter, false);

    g.x = x;
    g.y = y;

    if (this.groupIdCounter == 1) {
      g.initialGroup = true;
    }

    this.groups.push(g);

    this.getUpdatedGroups.emit(this.groups);

    console.log(this.groups);

    return g.id;
  }

  setAddingGroup(val: boolean) {
    this.isAddingGroup = val;
    this.addingTransition = 0;

    this.updateBtnState.emit();
  }

  setAddingTransition(val: number) {
    this.addingTransition = val;
    this.isAddingGroup = false;

    this.updateBtnState.emit();
  }

  getGroupById(id: number): Group {
    let g: Group | undefined = this.groups.find((x: Group) => x.id === id);

    if (g) {
      return g;
    }
    return new Group(id, false);
  }

  setGroup(group: Group) {
    let gs: Group[] = this.groups.filter((x: Group) => x.id != group.id);

    gs.push(group);

    this.groups = gs;
  }

  loadInteractionFromLocal() {
    let xmlString = localStorage.getItem('interactionXML');

    console.log(xmlString);
  }

  saveInteractionToLocal() {

    let xmlString = '';
    //xmlString += '<?xml version="1.0" encoding="utf-8"?>'
    xmlString += '<nta>';
    xmlString += '<name>interaction</name>';

    //add groups
    this.groups.forEach(group => {
        xmlString += '<group id="' + group.id + '" init="' + group.initialGroup + '" x="' + group.x + '" y="' + group.y + '">';
        xmlString += '<name>' + group.name + '</name>';
        group.micros.forEach(micro => {
            xmlString += '<micro>';
            xmlString += '<name>' + micro.type + '</name>';
            micro.parameters.forEach(parameter => {
                if (parameter.type == "array") { //unique case
                    xmlString += '<parameter type="array">';
                    xmlString += '<name>answers robot can recognize</name>'
                    /*
                    if (micro.parameterResults.find(x => x.paramId == parameter.id).currResult == '') {
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
                    */
                    xmlString += '</parameter>'
                } else { //normal case
                    xmlString += `
                      <parameter type="${parameter.type}" val="${micro.parameterResults.find(x => x.paramId == parameter.id)!.currResult}">'
                        ${parameter.variableName}
                      </parameter>`;
                }
            });
            xmlString += '</micro>';
        });
        xmlString += '</group>';
    });

    localStorage.setItem('interactionXML', xmlString);
  }
}