//TODOS and possible addons,
//add canvas "push" buttons to increase screen width/height
//add error flub handlers to display violations

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
        this.interaction.loadMicroTypes(initialTypes); //load types of microinteractions into the model
        loadMicrointeractions(this.interaction.trackedMicroTypes); //view loads micro interaction types on left sidebar

    }

    gatherMicrosFromDatabase(){
        //TODO access serverlet to get all micros and store them as micro types, for now hard code
        let parameter1 = new Parameter(0, "do you like chicken", true, false, false);
        let parameter2 = new Parameter(1, "fill in field", false, true, false);
        let parameter3 = new Parameter(2, "select option", false, false, true,["test", "option", "close"]);
        let parameters1 = [parameter1, parameter2];
        let micro1 = new MicroType("chicken", parameters1);
        let micro2 = new MicroType("greeter", [parameter3]);

        let microTypes = [];
        microTypes.push(micro1);
        microTypes.push(micro2);
        return microTypes;
    }
}


//------- important event handlers and functions related to the controller --------------------------------

function exportToXML(){
    let JSONInteraction = interactionController.interaction.exportModelToJSON();
    console.log(JSONInteraction);
}


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
    var microID = micro.getAttribute("microid").replace(/\D/g, '');;
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
    let modelGroupID = groupID.replace(/\D/g, ''); //model stores group id as whole numbers
    let deleted = interactionController.interaction.removeGroup(modelGroupID);//model (also removes transitions that are connected to it)
    if (deleted){
        removeGroupFromView(groupID); //view
    }
    
}

function addTransition(firstGroup, secondGroup){
    let id = interactionController.interaction.addTransition(firstGroup.getAttribute("group-num"), secondGroup.getAttribute("group-num"));//model
    drawTransition(id, firstGroup, secondGroup);//view
}

var allMicroTypes = [];

function loadMicrointeractions(microTypes) {
    let sidebar = document.getElementById("interaction-microinteraction-container");
    //load microinteractions from database, for now they are hard coded
    allMicroTypes = [];
    for(let i=0;i<microTypes.length;i++){
        let newMicro = document.createElement("div");
        newMicro.setAttribute("id", i);
        newMicro.setAttribute("type", microTypes[i].type);
        newMicro.classList.add("micro-box");
        newMicro.classList.add("mt-2");
        newMicro.innerText = microTypes[i].type;
        allMicroTypes.push(newMicro);
    }
    for (let i = 0; i < allMicroTypes.length; i++) {
        allMicroTypes[i].setAttribute("id", ("microtype-" + i));
        allMicroTypes[i].setAttribute("draggable", true);
        allMicroTypes[i].setAttribute("onDragStart", "drag_start(event)");
        let microTypeRow = document.createElement("div");
        microTypeRow.classList.add("row");
        microTypeRow.appendChild(allMicroTypes[i]);
        sidebar.appendChild(microTypeRow);
    }

    

}






//-----------------------------------end of important controller functions ----------------------------------



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

//-------------------------Moving and dragging functionality-------------------------------------------------------------------

//this handles the drag and drop events for moving things around
function drag_start(event) {
    var style = window.getComputedStyle(event.target, null);
    var str = (parseInt(style.getPropertyValue("left")) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top")) - event.clientY) + ',' + event.target.id;
    event.dataTransfer.setData("Text", str); //we are storing x , y , id   (where id is id of thing clicked on)
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

    if (dm === null || !dm.classList.contains("group-box")) {
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
    $('#transition-states-panel').hide();
    $('#parameters-panel').hide();
  });

function setupInteractionCanvas(){ //TODO redo this into clicking on groups
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

//==================================creating/adding dom elements -------------------------------------------------------------------
function newMicroBox(type) {
    let microBox = document.createElement("div");
    microBox.classList.add("micro-box");
    microBox.oncontextmenu = rightClickMicro;
    microBox.setAttribute("id", ("microbox" + numMicros));
    microBox.setAttribute("type", "microbox");
    microBox.setAttribute("micro-type:", type);
    microBox.innerText = type;
    microBox.addEventListener("click", leftCLickGroupMicro);
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
                // newGroup.classList.add("d-flex");
                // newGroup.classList.add("justify-content-center");
                newGroup.setAttribute("style", "left: " + (ev.clientX-canvas.offsetLeft) + "px; top: " +  (ev.clientY-canvas.offsetTop) + "px;");       //
                newGroup.setAttribute("id", ("group" + groupID));
                newGroup.setAttribute("group-num",groupID);
                newGroup.setAttribute("draggable", true);
                newGroup.setAttribute("onDragStart","drag_start(event)");
                newGroup.setAttribute("onDrop","dropOnGroup(event)");
                newGroup.setAttribute("type", "group");
                newGroup.setAttribute("onClick", "clickedGroup()");
                if(interactionController.interaction.getGroup(groupID).initialGroup){
                    newGroup.classList.add('group-box-initial');
                }
                newGroup.oncontextmenu = rightClickGroup;
                numBoxes++;
                var interactionCanvas = document.getElementById('interaction-group-canvas');
                interactionCanvas.appendChild(newGroup);
                controlBtnPressed = false;
                applyButtonColor(document.getElementById("newGroupBtn"));
}

function clickedGroup(){
   // console.log("clicked on group");
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

//--------drawing/redrawing lines and transitions
function drawTransition(id, firstGroup, secondGroup) {
    if (firstGroup === secondGroup) {
        return;
    }
    var canvas = document.getElementById('interaction-group-canvas');
    var newLine = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    canvas.appendChild(newLine);
    //var newText = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    newLine.classList.add('svg-arrow');
    newLine.setAttribute("type", "transition");
    newLine.setAttribute("transid",id);
    newLine.setAttribute("id", "line-" + firstGroup.id + "-" + secondGroup.id);
    newLine.setAttribute("group1", firstGroup.id);
    newLine.setAttribute("group2", secondGroup.id);

    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    //draw line from nearest edge of first box to nearest edge of second box
    //transitions go from an out point a third of the way down a side of a box to an in point two thirds of the way down the side of a box, with an in point an out point rotated in similar fashion
    let shortestLength = 999999999999;
    let x1 = parseInt(firstGroup.style.left, 10);
    let x2 = parseInt(secondGroup.style.left, 10);
    let y1 = parseInt(firstGroup.style.top, 10);
    let y2 = parseInt(secondGroup.style.top, 10);

    let NOut = { x: x1 + firstGroup.offsetWidth / 3, y: y1 };
    let EOut = { x: x1 + firstGroup.offsetWidth, y: y1 + firstGroup.offsetHeight / 3 };
    let SOut = { x: x1 + (firstGroup.offsetWidth / 3) * 2, y: y1 + firstGroup.offsetHeight };
    let WOut = { x: x1, y: y1 + (firstGroup.offsetHeight / 3) * 2 }

    let NIn = { x: x2 + (secondGroup.offsetWidth / 3) * 2, y: y2 };
    let EIn = { x: x2 + secondGroup.offsetWidth, y: y2 + (secondGroup.offsetHeight / 3) * 2 };
    let SIn = { x: x2 + (secondGroup.offsetWidth / 3), y: y2 + secondGroup.offsetHeight };
    let WIn = { x: x2, y: y2 + (secondGroup.offsetHeight / 3) }

    let outs = [NOut, EOut, SOut, WOut];
    let ins = [NIn, EIn, SIn, WIn];
    let distances = [];
    outs.forEach(function (point1) {
        ins.forEach(function (point2) {
            let d = Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2), 2);
            distances.push({ p1: point1, p2: point2, distance: d });
        });
    });
    let smallest = distances.pop();
    distances.forEach(function (line) {
        if (line.distance < smallest.distance) {
            smallest = line;
        }
    });
    line.setAttribute("x1", smallest.p1.x + "px");
    line.setAttribute("x2", smallest.p2.x + "px");
    line.setAttribute("y1", smallest.p1.y + "px");
    line.setAttribute("y2", smallest.p2.y + "px");
    line.classList.add('arrow');
    newLine.appendChild(line);

    var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.classList.add("arrow-text");
    text.setAttribute("x", ((smallest.p2.x + smallest.p1.x) / 2).toString());
    text.setAttribute("y", (((smallest.p2.y + smallest.p1.y) / 2) + 15).toString());
    text.setAttribute("text-anchor", "middle");
    let transState = interactionController.interaction.getTransitionState(id);
    newLine.appendChild(text);
    let ttm = ""; //transition text message
    ttm += transState.ready ? "Ready " : "";
    ttm += transState.busy ? "Busy " : "";
    ttm += transState.suspended ? "Suspended" : "";
    text.textContent = ttm;  
    text.classList.add("svg-arrow-text");
    text.addEventListener("click", leftCLickTransition);
    

    let bbox = text.getBBox();
    var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", (bbox.x).toString());
    rect.setAttribute("y", (bbox.y).toString());
    rect.setAttribute("width", bbox.width);
    rect.setAttribute("height", bbox.height);
    rect.setAttribute("fill", "yellow");
    newLine.insertBefore(rect,text);
    
}

function redrawConnectedLines(group) { //gets lines connected to this group and redraws them
    var list = document.getElementsByClassName('svg-arrow'); //problem with list getting bad data
    const listLength = list.length;
    var linesToRemove = [];
    for (let t = 0; t < listLength; t++) {
        let svgArrow = list[t];
        if (svgArrow.getAttribute("group1") === group.id) {
            linesToRemove.push(svgArrow);
            drawTransition(svgArrow.getAttribute("transid"), group, document.getElementById(svgArrow.getAttribute("group2")));
            //do move
        } else if (svgArrow.getAttribute("group2") === group.id) {
            linesToRemove.push(svgArrow);
 
            drawTransition(svgArrow.getAttribute("transid"),document.getElementById(svgArrow.getAttribute("group1")), group);
        }
    }

    for (let i = 0; i < linesToRemove.length; i++) {
        document.getElementById("interaction-group-canvas").removeChild(linesToRemove[i]);
    }
}









//--------------------------------left and right click on items in canvas=========================
document.onclick = hideMenu;

//left clicks
function leftCLickGroupMicro(){ 
    //display properties on property sidebar
    $('#transition-states-panel').hide();
    $('#parameters-panel').show();

    let selectedMicro = this;
    $('#no-micros-parameters').hide();
    let parameters = interactionController.interaction.getMicroParameters(this.getAttribute("id").replace(/\D/g, ''));

    let parametersPanel = $('#parameters-panel');
    parametersPanel.empty();
    parametersPanel.append($('<label style="font-size: 17px; border-bottom: 2px solid black;">' +
             ' Parameters ' +
           ' </label >'));
    let row = $('<div class="row"></div>');
    let col = $('<div class="col">');
    let displayedParams = $('<form microID=' + selectedMicro.getAttribute("microid") + ' onsubmit="saveParameters(\'' + this.id + '-form\')" id="'+this.id+'-form" ></form>');   
    displayedParams.submit(function (e) {
        e.preventDefault();
    });
    parametersPanel.append(row);
    row.append(displayedParams);
    displayedParams.append(col);

    //parse through each parameter and build a gui representation
    parameters.forEach(function(param){
        let paramType = "";
        if (param.isBoolean) {
            paramType = 'bool';
        } else if (param.isField) {
            paramType = 'field';
        } else if (param.isDropDown) {
            paramType = 'selection';
        }
        let curDispParam = $('<div class="parameter" type="param" paramid = "'+ param.id + '" paramType="'+ paramType + '" id="' + selectedMicro.id + "-param" + param.id+ '"></div>');
        if(param.isBoolean){
            curDispParam.append($('<Label type="bool" identifier="mainLbl" class="row">' + param.description + '</Label>'));
            curDispParam.append($('<input type="radio"  name="p-bool" value="yes"></input>'));
            curDispParam.append($('<label for="selTrue">Yes</label><br>'));
            curDispParam.append($('<input type="radio"  name="p-bool" value="no">'));
            curDispParam.append($('<label for="selFalse">No</label><br>')); 
        }else if(param.isField){
            curDispParam.append($('<Label type="field" identifier="mainLbl" class="row">' + param.description + '</Label>'));
            curDispParam.append($('<textarea name="p-field" rows="4" cols="24"></textarea>'));            
        }else if(param.isDropDown){
            curDispParam.append($('<Label type="select" identifier="mainLbl" class="row">' + param.description + '</Label>'));
            let selections = $('<select class="form-select" name="p-selection"></select>');
            param.dropDownSelections.forEach(function(selection){
                selections.append('<option value="' + selection + '">' + selection + '</option>');
            });
            curDispParam.append(selections);
        }else{
            console.log("ERROR: param type not recognize");
            return;
        }
        displayedParams.append(curDispParam);
    });
    displayedParams.append($('<button type="submit">Save</button>'));
}



function saveParameters(formId) {
    let form = $('#' + formId + " [type='param']");
    let microID = $('#' + formId).attr('microid');
    //for every parameter
    let results = [];
    for (let i = 0; i < form.length; i++) {
        let type = form[i].getAttribute('paramType');
        let paramID = form[i].getAttribute('paramid');
        let curResult = "";
        switch(type){
            case "bool":
                let ele = $('#' + formId + ' [paramid="' + paramID + '"] :radio ')
                for (j = 0; j < ele.length; j++) {
                    if (ele[j].checked)
                        curResult = ele[j].value
                }
                break;
            case "field":
                let eleField = $('#' + formId + ' [paramid="' + paramID + '"] :input ')
                curResult = eleField.val();
                break;
            case "selection":
                let eleSelect = $('#' + formId + ' [name ="' + "p-selection" + '"]');
                curResult = eleSelect.val();
                break;
        }
        results.push({paramID, curResult});
    }
    interactionController.interaction.setMicroResults(microID, results);
}

/*
function clickOnCanvas(e){
    console.log("clickedo n canvas");
    hideMenu(e);
}
*/


let curTransitionText;

function leftCLickTransition(e) {
    $('#parameters-panel').hide();
    $('#transition-states-panel').show();
    curTransitionText = e.srcElement;
    let modelTransitionID = e.srcElement.parentNode.getAttribute("transid");
    let transitionState = interactionController.interaction.getTransitionState(modelTransitionID);
    //set checkboxes to current state of this transition
    $('#context-ready').prop('checked', transitionState.ready );
    $('#context-busy').prop('checked', transitionState.busy);
    $('#context-suspended').prop('checked', transitionState.suspended);
    $('#transition-states-panel').attr('curtid', e.srcElement.parentNode.getAttribute("id")); //cur transition id (the html dom one not the model one)
}

function updateTransition(){
    let transitionView = $('#'+ $('#transition-states-panel').attr('curtid'));
    let transitionModelID = transitionView.attr('transid');
    let transitionText = $('#' + $('#transition-states-panel').attr('curtid') + ' text');
    let rect = $('#' + $('#transition-states-panel').attr('curtid') + ' rect'); //transition texts background
    let stateReady = $('#context-ready').prop('checked');
    let stateBusy = $('#context-busy').prop('checked');
    let stateSuspended = $('#context-suspended').prop('checked');
    let transitionState = { ready: stateReady, busy: stateBusy, suspended: stateSuspended};
    let ttm = "" ; //transition text message
    ttm += stateReady ? "Ready <br/>" : "<br/>";
    ttm += stateBusy ? "Busy " : "";
    ttm += stateSuspended ? "Suspended" : "";
    console.log(ttm);
    interactionController.interaction.setTransitionState(transitionModelID, transitionState);
    transitionText.text("test \n test 2 <br/> test3");

    // console.log(transitionText);
    // var width = transitionText.width();
    // console.log(width);
    // let bbox = transitionText.getBBox();
    // rect.setAttribute("x", (bbox.x).toString());
    // rect.setAttribute("y", (bbox.y).toString());
    // rect.setAttribute("width", bbox.width);
    // rect.setAttribute("height", bbox.height);
    // rect.setAttribute("fill", "yellow");
}



//right clicks

function hideMenu(e) {
    //console.log($('div[hideable="true"]'));
    //$('div[hideable="true"]').hide();
    //left click menu doesnt hide if clicked on
    /*
    if (e.srcElement != undefined && (itemLeftClicked == e.srcElement)){
        document.getElementById("contextMenuTransition").style.display = "block";
    }
    */
    
    //right click menues hide
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


   


