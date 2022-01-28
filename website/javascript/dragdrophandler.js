//test

//import * as model from "./model.js";
var interactionController;

//Adding and removing microinteractions to groups
document.addEventListener("DOMContentLoaded", () => {
    interactionController = new controller();
});

class controller {
    //interaction;

    constructor(){
        //load the interaction model
        this.interaction = new Interaction();
        var initialTypes = this.gatherMicrosFromDatabase();
        this.interaction.loadMicroTypes(initialTypes);
        loadMicrointeractions(this.interaction.trackedMicroTypes); //view loads micro interaction types on left sidebar

    }

    gatherMicrosFromDatabase(){
        //TODO access serverlet to get all micros and store them as micro types, for now hard code
        let parameter1 = new Parameter(0, "do you like chicken", true, false, false);
        let parameter2 = new Parameter(1, "fill in field", false, true, false);
        let parameters1 = {parameter1, parameter2};
        let micro1 = new MicroType("chicken", parameters1);


        let microTypes = [];
        microTypes.push(micro1);
        return microTypes;
    }
}


//------- important event handlers and functions related to the controller --------------

function dropOnGroup(event) {
    let offset = event.dataTransfer.getData("Text").split(',');//expects x , y , id
    let micro = document.getElementById(offset[2]); //this is the micro type box element, we check this below
    if (micro === null || micro.classList === null || !micro.classList.contains("micro-box")) {
        return false;
    }

    let groupBox = event.target;
    let groupID = groupBox.getAttribute("group-num");

    addMicroToGroup(groupID, micro.getAttribute("type"));

}


function addMicroToGroup(groupID, type){
    let newMicroID = interactionController.interaction.addMicroToGroup(groupID, type);//model
    let microBox = newMicroBox(type);
    microBox.setAttribute("id", "micro"+newMicroID);
    microBox.setAttribute("microID", newMicroID);
    addMicroBoxToGroupView(groupID, microBox);//view
}

function removeMicro(microBoxID){
    var micro = document.getElementById(microBoxID);
    var microID = micro.getAttribute("microid");
    let group = micro.parentNode;
    let groupID = group.getAttribute("group-num");
    interactionController.interaction.removeMicroFromGroup(groupID ,microID);//model
    group.removeChild(micro);//view
}


function addGroup(ev){
    groupID = interactionController.interaction.createGroup(); //model
    addGroupToView(ev, groupID); //view
}

function removeGroup(groupID) {
    interactionController.interaction.removeGroup(groupID);//model (also removes transitions that are connected to it)
    removeGroupFromView(groupID); //view
}

function addTransition(firstGroup, secondGroup){
    interactionController.interaction.addTransition(firstGroup.getAttribute("group-num"), secondGroup.getAttribute("group-num"));//model
    drawTransition(firstGroup, secondGroup);//view
}

var allMicroTypes = [];

function loadMicrointeractions(microTypes) {
    var microContainer = document.getElementById("interaction-microinteraction-container");
    var sidebar = document.getElementById("interaction-microinteraction-container");
    //load microinteractions from database, for now they are hard coded
    allMicroTypes = [];
    for(let i=0;i<microTypes.length;i++){
        let newMicro = document.createElement("div");
        newMicro.setAttribute("id", i);
        newMicro.setAttribute("type", microTypes[i].type);
        newMicro.classList.add("micro-box");
        newMicro.innerText = microTypes[i].type;
        allMicroTypes.push(newMicro);
    }

    var sidebar = document.getElementById("interaction-microinteraction-container");

    for (let i = 0; i < allMicroTypes.length; i++) {
        allMicroTypes[i].setAttribute("id", ("microtype-" + i));
        allMicroTypes[i].setAttribute("draggable", true);
        allMicroTypes[i].setAttribute("onDragStart", "drag_start(event)");
        sidebar.appendChild(allMicroTypes[i]);
    }

    

}






//-----------------------------------end of important controller things ----------------------------------



//Control Buttons----------------------------
var controlBtnPressed = false;
var lineBtnPressed = false;
function newGroupBtnPressed(val){
    if(controlBtnPressed){
        controlBtnPressed = false;
    }else{
        controlBtnPressed = true;
    }
    applyButtonColor(val);
}



function newLineBtnPressed(val){
    if(lineBtnPressed){
        lineBtnPressed = false;
    }else{
        lineBtnPressed = true;
    }
    applyButtonColor(val);
}


function applyButtonColor(button){
    if(button.className.includes('button-pressed')){
        button.classList.remove('button-pressed');
        button.classList.add('button-unpressed');
    }else{
        button.classList.remove('button-unpressed');
        button.classList.add('button-pressed');
    }
}





//Moving and dragging functionality-------------------------------------------------------------------

//this handles the drag and drop events for moving things around
function drag_start(event) {
    var list = document.getElementsByClassName('svg-arrow');
    var style = window.getComputedStyle(event.target, null);
    var str = (parseInt(style.getPropertyValue("left")) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top")) - event.clientY) + ',' + event.target.id;
    event.dataTransfer.setData("Text", str); //we are returning x , y , id 
}

function drag_over(event) {
    event.preventDefault();
    return false;
}

//used for moving groups only at the moment
function dropOnInteractionCanvas(event) {
    var list = document.getElementsByClassName('svg-arrow');
    var offset = event.dataTransfer.getData("Text").split(',');//expects x , y , id
    var dm = document.getElementById(offset[2]); //this is (hopefully) the group box element, we check this below

    if (dm === null || dm.classList === null || !dm.classList.contains("group-box")) {
        return false;
    }
    //check bounds for canvas
    var i = event.clientX + parseInt(offset[0], 10)
    if (event.clientX + parseInt(offset[0], 10) < 0) {
        dm.style.left = 1 + 'px';
    } else {
        dm.style.left = (event.clientX + parseInt(offset[0], 10)) + 'px';
    }
    if ((event.clientY + parseInt(offset[1], 10)) < 0) {
        dm.style.top = 1 + 'px';
    } else {
        dm.style.top = (event.clientY + parseInt(offset[1], 10)) + 'px';
    }

    //TOOD stop from being placed on another group
    var list = document.getElementsByClassName('svg-arrow');
    //TODO refresh line if one is connected instead of remove and replace
    redrawConnectedLines(dm);
    event.preventDefault();
    return false;
}

var numBoxes = 0; //used to set unique id
var numMicros = 0;
var firstGroupInLine = null; //stores the group elements for making lines
var secondGroupInLine = null;

//setup clicking on canvas to add group and draw line
document.addEventListener("DOMContentLoaded", () => {
    setupInteractionCanvas();
  });

function setupInteractionCanvas(){
    var canvas = document.getElementById('interaction-group-canvas');
    canvas.addEventListener("click", (ev) => {
        
        if(lineBtnPressed){
            if(firstGroupInLine === null){
                if(!ev.target.className.includes('group-box')){
                    return false;
                }
                firstGroupInLine = ev.target;
                ev.target.classList.add('group-box-selected');
            }else{
                if(!ev.target.className.includes('group-box')){
                    return false;
                }

                //draw transition

                
                secondGroupInLine = ev.target;
                addTransition(firstGroupInLine, secondGroupInLine);
                firstGroupInLine.classList.remove("group-box-selected");
                firstGroupInLine = null;
                secondGroupInLine = null;
                lineBtnPressed = false;
                applyButtonColor(document.getElementById("drawLineBtn"));
            }

         }else if(controlBtnPressed){
        //if we click in the canvas and not on a box
            addGroup(ev);
        }

    });
    return false;
}



//creating/adding dom elements -------------------------------------------------------------------
function newMicroBox(type) {
    let microBox = document.createElement("div");
    microBox.classList.add("micro-box");
    microBox.oncontextmenu = rightClickMicro;
    microBox.setAttribute("id", ("microbox" + numMicros));
    microBox.innerText = type;
    //TODO add parameters when clicked on to show up in right sidebar




    numMicros++;
    return microBox;
}


function addMicroBoxToGroupView(groupID, microBox){
    var group = document.getElementById("group"+groupID);
    group.appendChild(microBox);
    //TODO (possibly add parameters to right sidebar here)
}

function addGroupToView(ev, groupID){
    var canvas = document.getElementById('interaction-group-canvas');
    var newGroup = document.createElement("div");
                var title = document.createElement("div");
                title.innerText = interactionController.interaction.getGroup(groupID).name;
                newGroup.appendChild(title);
                newGroup.classList.add("group-box");
                newGroup.setAttribute("style", "left: " + (ev.clientX-canvas.offsetLeft) + "px; top: " +  (ev.clientY-canvas.offsetTop) + "px;");       //
                newGroup.setAttribute("id", ("group" + groupID));
                newGroup.setAttribute("group-num",groupID);
                newGroup.setAttribute("draggable", true);
                newGroup.setAttribute("onDragStart","drag_start(event)");
                newGroup.setAttribute("onDrop","dropOnGroup(event)");
                newGroup.oncontextmenu = rightClickGroup;
                numBoxes++;
                var interactionCanvas = document.getElementById('interaction-group-canvas');
                interactionCanvas.appendChild(newGroup);
                controlBtnPressed = false;
                applyButtonColor(document.getElementById("newGroupBtn"));
}


function removeGroupFromView(groupID){
    var groupToRemove = document.getElementById(groupID);
    //now remove connected lines
    var list = document.getElementsByClassName('svg-arrow'); //problem with list getting bad data
    const listLength = list.length;
    var linesToRemove = [];
    for(let t=0;t<listLength;t++){
        let svgArrow = list[t];
        if(svgArrow.getAttribute("group1") === groupID){
            linesToRemove.push(svgArrow);
        }else if(svgArrow.getAttribute("group2") === groupID){
            linesToRemove.push(svgArrow);
        }
    }

    for(let i = 0; i < linesToRemove.length;i++){
        document.getElementById("interaction-group-canvas").removeChild(linesToRemove[i]);
    }

    document.getElementById("interaction-group-canvas").removeChild(groupToRemove);
}


//handel right click on group menu
document.onclick = hideMenu;
function hideMenu() {
    document.getElementById("contextMenuGroup").style.display = "none";
    document.getElementById("contextMenuMicro").style.display = "none";
}



function rightClickGroup(e) {
    e.preventDefault();
        if (document.getElementById("contextMenuGroup")
                .style.display == "block")
            hideMenu();
        else{
            var menu = document.getElementById("contextMenuGroup");
            document.getElementById("removeGroupBtn").setAttribute('value', e.target.id);
            menu.style.display = 'block';
            menu.style.left = e.pageX + "px";
            menu.style.top = e.pageY + "px";
        }
    }

    function rightClickMicro(e) {
        e.preventDefault();
            if (document.getElementById("contextMenuMicro")
                    .style.display == "block")
                hideMenu();
            else{
                var menu = document.getElementById("contextMenuMicro");
                document.getElementById("removeMicroBtn").setAttribute('value', e.target.id);
                menu.style.display = 'block';
                menu.style.left = e.pageX + "px";
                menu.style.top = e.pageY + "px";
            }
        }


//--------drawing/redrawing lines and transitions
function drawTransition(firstGroup, secondGroup){
    if(firstGroup === secondGroup){
        return;
    }
    var canvas = document.getElementById('interaction-group-canvas');
    var newLine = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    //var newText = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    newLine.classList.add('svg-arrow');
    //newText.classList.add('svg-arrow-text');
    var text = document.createElementNS("http://www.w3.org/2000/svg", "text");

    text.setAttribute("style","font: 9px sans-serif;");
    text.setAttribute("x", ((parseInt(secondGroup.style.left) + parseInt(firstGroup.style.left))/2).toString());
    text.setAttribute("y", ((parseInt(secondGroup.style.top) + parseInt(firstGroup.style.top))/2).toString());
    text.setAttribute("text-anchor","middle");
    text.textContent = "Ready";  //find way to auto figure out    
    newLine.appendChild(text);
    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", firstGroup.style.left);
    line.setAttribute("x2",secondGroup.style.left);
    line.setAttribute("y1",firstGroup.style.top);
    line.setAttribute("y2",secondGroup.style.top);
    line.classList.add('arrow');
    newLine.appendChild(line);
    newLine.setAttribute("id", "line-" + firstGroup.id + "-" + secondGroup.id);
    newLine.setAttribute("group1", firstGroup.id);
    newLine.setAttribute("group2", secondGroup.id);

    text.classList.add("svg-arrow-text");
    text.addEventListener("click", function(){
        console.log("clicked");
    });
    canvas.appendChild(newLine);
    //canvas.appendChild(newText);
    var list = document.getElementsByClassName('svg-arrow');
}

function redrawConnectedLines(group){
    var list = document.getElementsByClassName('svg-arrow'); //problem with list getting bad data
    const listLength = list.length;
    var linesToRemove = [];
    for(let t=0;t<listLength;t++){
        let svgArrow = list[t];
        if(svgArrow.getAttribute("group1") === group.id){
            linesToRemove.push(svgArrow);
            drawTransition(group,document.getElementById(svgArrow.getAttribute("group2")));
            //do move
        }else if(svgArrow.getAttribute("group2") === group.id){
            linesToRemove.push(svgArrow);
            drawTransition(document.getElementById(svgArrow.getAttribute("group1")), group);
        }
    }

    for(let i = 0; i < linesToRemove.length;i++){
        document.getElementById("interaction-group-canvas").removeChild(linesToRemove[i]);
    }
}






