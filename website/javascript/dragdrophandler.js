/* Notes
Attributes data-transid, data-groupid, data-microid are reserved 
for the group, micro and transition elements as they are used to link the
database element ids to their respective ui elements

So dont name other attributes by those names!
*/


var IC; //Interaction Controller instance, this holds the model and relevant controller functions
document.addEventListener("DOMContentLoaded", () => {
    $('#interactionFileUpload').change(loadInteractionFromUploadXMLFile);

    IC = new controller();//create new instance of our interaction controller and store int in IC
    let xmlText = localStorage.getItem("interactionXML");
    if(xmlText != null){
        
        loadInteractionFromXML(xmlText);
    }
});

window.onbeforeunload = function () {
    IC.saveGroupPositions();
    localStorage.setItem("interactionXML", IC.interaction.exportModelToXML());
}

class controller {
    //interaction; -- interaction instance is stored in this class
    //microTypes; --list of available micro interactions and their parameters
    constructor(){
        //load the interaction model
        this.interaction = new Interaction();
        this.microTypes = this.gatherMicrosFromDatabase();
        this.interaction.loadMicroTypes(this.microTypes); //load types of microinteractions into the model
        loadMicrointeractions(this.interaction.trackedMicroTypes); //view loads micro interaction types on left sidebar
    }

    clear(){
        this.interaction = new Interaction();
        this.interaction.loadMicroTypes(this.microTypes);
        $('#interaction-group-canvas').empty();
        $('#transition-states-panel').hide();
        $('#parameters-panel').hide();
        document.getElementById("interactionFileUpload").value = null;
    }

    gatherMicrosFromDatabase(){
        //TODO access serverlet to get all micros and store them as micro types, for now these are the hard coded versions
        let microTypes = [];

        //greeter
        let parameter0 = new Parameter(0, "Wait for Response", "Wait_for_response", "Set whether the robot waits for the human to greet back", "bool");
        let parameter1 = new Parameter(1, "Greet with Speech", "Greet_with_speech", "Set whether the robot greets the human with speech", "bool");
        let parameter2 = new Parameter(2, "Greet with Handshake", "Greet_with_handshake", "Set whether the robot extends its arm for a handshake", "bool");
        let microGreeter = new MicroType("Greeter", [parameter0,parameter1,parameter2]);
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
        let parameter8 = new Parameter(8, "Instruction", "Instruction", "The instruction that the robot will provide the human","str");
        let microInstruct = new MicroType("Instruction",[parameter8]);
        microTypes.push(microInstruct);

        //handoff
        let microHandoff = new MicroType("Handoff",[]);
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
        return microTypes;
    }

    //sends xml model to database in the request and gets back the violations in the response
    sendModelToDatabase(xmlString){
        let xmlDoc;
        $('#verificationStatusText').text("Validating...");
        $.ajax({
            type: "POST",
            url: "/SocialVerificationWebsite/ViolationParser",
            data: xmlString,
            contentType: "text/xml",
            cache: false,
            error: function (err) { $('#verificationStatusText').text("Error"); console.error("err response below"); console.error(err); },
            success: function (xml) {
               //get back response, if 200 it should give back a list of violations
                console.log(xml);
                xmlDoc = xml;

                //parse violations
                let violations = []
                let violationList = xmlDoc.getElementsByTagName("violation_list")[0].childNodes;
                for (let i = 0; i < violationList.length;i++){
                    let violationChild = violationList[i];
                    let category = violationChild.getElementsByTagName("category")[0].textContent;
                    let type = violationChild.getElementsByTagName("type")[0].textContent;
                    let description = violationChild.getElementsByTagName("description")[0].textContent;
                    var violationObject = new Violation(category, type, description);

                    if (category == 'group'){
                        let violatorGroups = violationChild.getElementsByTagName("violator_groups")[0].childNodes;
                        for(let j=0;j<violatorGroups.length;j++){
                            let violaterGroupName = violatorGroups[j].textContent; //getElementsByTagName("group")[0].
                            violationObject.addGroupViolating(violaterGroupName);
                        }
                    }
                    violations.push(violationObject);
                }

                IC.interaction.setViolations(violations); //model
                IC.makeConflicts(IC.interaction.getViolations()); //view
                $('#verificationStatusText').text("Complete");
            }
        });
    }

    //update terminal to display all social norm violations
    makeConflicts(violations){
        let terminalString = "";
        violations.forEach(violation =>{
            if (violation.category == "interaction"){
                terminalString += "Interaction is violating property: " + violation.type + " Desc: " + violation.description + "\n";
            }
            if (violation.category == "group") {
                let groupString = "";
                //console.log(violation.getGroupsViolating());
                violation.violatorGroups.forEach(groupName=>{
                    groupString += groupName + " ";
                })
                terminalString += "Group(s) " + groupString + " are violating property: " + violation.type + " Desc: " + violation.description + "\n";
            }
            terminalString += "\n"
        })
        document.getElementById('terminal-textarea').textContent = terminalString;

    }

    saveGroupPositions(){
        let allGroups = $("[data-type='group-box']");
        if (allGroups.length == 0) {
            return
        }
        for (let i = 0; i < allGroups.length; i++) {
            let group = allGroups[i];
            IC.interaction.setGroupXY(group.getAttribute("data-groupid"), parseInt(group.style.left), parseInt(group.style.top));
        }
    }
    
    exportToXML() {
        let JSONInteraction = IC.interaction.exportModelToJSON();
        return JSONInteraction;
    }
}

function saveToFile() {
    //update group positions in model
    IC.saveGroupPositions();

    //save to file
    let file = "interaction.xml";
    let text = IC.interaction.exportModelToXML();
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8, '+ encodeURIComponent(text));
    element.setAttribute('download', file);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function loadFromFile(){
    
    $('#interactionFileUpload').click(); //see loadInteractionFromXMLFile as thats the function called with the xml file
}
function loadInteractionFromUploadXMLFile(e){
    
    let file = e.target.files[0];
    IC.clear();
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onloadend = function () {
        let text = reader.result;
        console.log(reader.result);
        parser = new DOMParser();
        let xmlDoc = parser.parseFromString(text, "text/xml");;
        let root = xmlDoc.getElementsByTagName('nta');
        let groups = xmlDoc.getElementsByTagName("group");
        let transitions = xmlDoc.getElementsByTagName("transition");

        for(let i=0;i<groups.length;i++){
            let curGroup = groups[i];
            let groupID = curGroup.getAttribute("id");
            let isInitialGroup = curGroup.getAttribute("init");
            if(isInitialGroup == "true"){
                isInitialGroup = true;
            }else{
                isInitialGroup = false;
            }

            let x = curGroup.getAttribute("x");
            let y = curGroup.getAttribute("y");
            let name = curGroup.getElementsByTagName("name")[0].textContent;
            //load group
            addGroup(x, y, groupID,isInitialGroup,name);
            let micros = curGroup.getElementsByTagName("micro");
            //load micros
            for(let j=0;j<micros.length;j++){
                let curMicro = micros[j];
                let microName = curMicro.getElementsByTagName("name")[0].textContent;
                //load template of micro into group
                let microID = addMicroToGroup(groupID, microName);

                //load saved values of micro into group
                let parameters = curMicro.getElementsByTagName("parameter");
                for(let k = 0; k< parameters.length; k++){
                    let curParameter = parameters[k];
                    let curType = curParameter.getAttribute("type");
                    if(curType == "array"){
                        let arrayItems = curParameter.getElementsByTagName('item');
                        let arrayVariable = curParameter.getElementsByTagName('name')[0].textContent;
                        let arrayResults = [];
                        for(let m=0;m<arrayItems.length;m++){
                            let curItem = arrayItems[m];
                            let itemVal = curItem.getAttribute('val');
                            let itemLink = curItem.getAttribute('link');
                            if(itemLink == 'human_ready'){
                                itemLink = 'Human Ready';
                            } else if (itemLink == 'human_ignore'){
                                itemLink = 'Human Suspended';
                            }
                            arrayResults.push({val: itemVal, linkTitle: itemLink});
                        }
                        IC.interaction.setMicroParamValByVariable(microID, arrayVariable, arrayResults);

                    }else{
                        let curVal = curParameter.getAttribute("val");
                        let paramVariable = curParameter.textContent;
                        IC.interaction.setMicroParamValByVariable(microID, paramVariable, curVal);
                    }
                }
            }
        }
        for (let i = 0; i < transitions.length;i++){
            let curTransition = transitions[i];
            let group1ID = curTransition.getElementsByTagName("source")[0].getAttribute("ref");
            let group2ID = curTransition.getElementsByTagName("target")[0].getAttribute("ref");
            let guards = curTransition.getElementsByTagName("guard");
            let humanReady = false;
            let humanBusy = false;
            let humanIgnored=false;
            for(let j=0;j<guards.length;j++){
                let curGuard = guards[j];
                if(curGuard.getAttribute("condition") == "human_ready"){
                    humanReady = true;
                } else if (curGuard.getAttribute("condition") == "human_busy"){
                    humanBusy = true;
                } else if (curGuard.getAttribute("condition") == "human_ignore"){
                    humanIgnored= true;
                }
            }
            let newTransID = addTransitionByID(group1ID,group2ID);
            updateTransitionStates(newTransID, humanReady, humanBusy, humanIgnored);
            
        }
    };
}

function loadInteractionFromXML(xmlText) {
    let text = xmlText;
    parser = new DOMParser();
    let xmlDoc = parser.parseFromString(text, "text/xml");;
    let root = xmlDoc.getElementsByTagName('nta');
    let groups = xmlDoc.getElementsByTagName("group");
    let transitions = xmlDoc.getElementsByTagName("transition");

    for (let i = 0; i < groups.length; i++) {
        let curGroup = groups[i];
        let groupID = curGroup.getAttribute("id");
        let isInitialGroup = curGroup.getAttribute("init");
        if (isInitialGroup == "true") {
            isInitialGroup = true;
        } else {
            isInitialGroup = false;
        }

        let x = curGroup.getAttribute("x");
        let y = curGroup.getAttribute("y");
        let name = curGroup.getElementsByTagName("name")[0].textContent;
        //load group
        addGroup(x, y, groupID, isInitialGroup, name);
        let micros = curGroup.getElementsByTagName("micro");
        //load micros
        for (let j = 0; j < micros.length; j++) {
            let curMicro = micros[j];
            let microName = curMicro.getElementsByTagName("name")[0].textContent;
            //load template of micro into group
            let microID = addMicroToGroup(groupID, microName);

            //load saved values of micro into group
            let parameters = curMicro.getElementsByTagName("parameter");
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
                    IC.interaction.setMicroParamValByVariable(microID, arrayVariable, arrayResults);

                } else {
                    let curVal = curParameter.getAttribute("val");
                    let paramVariable = curParameter.textContent;
                    IC.interaction.setMicroParamValByVariable(microID, paramVariable, curVal);
                }
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
        let newTransID = addTransitionByID(group1ID, group2ID);
        updateTransitionStates(newTransID, humanReady, humanBusy, humanIgnored);
    }
}

function verifyModel(){
    let modelXML = IC.interaction.exportModelToXML();
    console.log(modelXML);
    IC.sendModelToDatabase(modelXML);
}
//------- important event handlers and functions related to the controller --------------------------------

function exportToXML(){
    let JSONInteraction = IC.exportToXML();
    console.log(JSONInteraction);
}

function addGroupByClick(x, y) {
    let groupID = IC.interaction.createGroup(); //model
    addGroupToView(x, y, groupID); //view
}

function addGroup(x, y, id, isInitialGroup, name) {
    let groupID = IC.interaction.makeGroup(x, y, id, isInitialGroup, name); //model
    addGroupToView(x, y, groupID); //view
    return groupID;
}

function removeGroup(groupBoxID) {
    let group = document.getElementById(groupBoxID);
    let groupID = group.getAttribute("data-groupid"); //model stores group id as whole numbers
    let deleted = IC.interaction.removeGroup(groupID);//model (also removes transitions that are connected to it)
    if (deleted) { //there may be a reason this cant be deleted
        removeGroupFromView(group); //view
    }
    return groupID;
}

function addMicroToGroup(groupID, type){
    let groupBox = $("[data-groupid="+groupID+"]")[0] //get group box representing this group
    let newMicroID = IC.interaction.addMicroToGroup(groupID, type);//model
    let microBox = newMicroBox(newMicroID,type);
    microBox.setAttribute("data-microid", newMicroID);
    addMicroBoxToGroupView(groupBox, microBox);//view
    return newMicroID;
}

function removeMicro(microBoxID){
    var micro = document.getElementById(microBoxID);
    var microID = micro.getAttribute("data-microid");;
    let group = micro.parentNode;
    let groupID = group.getAttribute("data-groupid");
    IC.interaction.removeMicroFromGroup(groupID ,microID);//model
    group.removeChild(micro);//view
}



function addTransition(firstGroup, secondGroup){
    let id = IC.interaction.addTransition(firstGroup.getAttribute("data-groupid"), secondGroup.getAttribute("data-groupid"));//model
    if(id == -1){
        return -1;
    }
    drawTransition(id, firstGroup, secondGroup);//view
    return id;
}

function addTransitionByID(firstGroupID, secondGroupID) {
    let id = IC.interaction.addTransition(firstGroupID, secondGroupID);//model
    let firstGroup = $("[data-groupid=" + firstGroupID + "]")[0];
    let secondGroup = $("[data-groupid=" + secondGroupID + "]")[0];
    drawTransition(id, firstGroup, secondGroup);//view
    return id;
}

function updateTransitionStates(newTransID, humanReady, humanBusy, humanIgnored){
    let transitionState = { 'ready': humanReady, 'busy': humanBusy, 'suspended': humanIgnored } //humanReady,humanBusy,and humanIgnored should be bools
    IC.interaction.setTransitionState(newTransID, transitionState);
    updateTransitionByModelTransID(newTransID);
}


function removeTransition(htmlTransitionid) {
    let transition = document.getElementById(htmlTransitionid);

    IC.interaction.removeTransition(transition.getAttribute("data-transid"));//model
    document.getElementById("interaction-group-canvas").removeChild(transition); //view
}


function loadMicrointeractions(microTypes) {
    let sidebar = document.getElementById("interaction-microinteraction-container");
    //load microinteractions from database, for now they are hard coded
    for(let i=0;i<microTypes.length;i++){
        let newMicroBox = document.createElement("div");
        newMicroBox.setAttribute("data-micro-type", microTypes[i].type);
        newMicroBox.setAttribute("data-type", "microtype-box");
        newMicroBox.setAttribute("draggable", true);
        newMicroBox.setAttribute("onDragStart", "dragStart(event)");
        newMicroBox.setAttribute("id", uuidv4());
        newMicroBox.classList.add("micro-box");
        newMicroBox.classList.add("mt-2");
        newMicroBox.classList.add("row");
        newMicroBox.classList.add("justify-content-center");
        newMicroBox.innerText = microTypes[i].type;
        sidebar.appendChild(newMicroBox);
    }
}

function clearAll(){
    IC.clear();
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
    console.log("line pressed");
    console.log(lineBtnPressed);
    event.preventDefault();
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
function dragStart(event) {
    var style = window.getComputedStyle(event.target, null);
    var obj = {x:(parseInt(style.getPropertyValue("left")) - event.clientX), y: (parseInt(style.getPropertyValue("top")) - event.clientY), target: event.target.id};
    event.dataTransfer.setData("text", JSON.stringify(obj)); //{x: int, y: int, target: event.target.id}
}

function dragOver(event) {
    event.preventDefault();
    return false;
}

function dropOnGroup(event) {
    let dragged = JSON.parse(event.dataTransfer.getData("text"));
    let micro = document.getElementById(dragged.target); //this is the micro type box element, we check this below
    if (micro == null || !(micro.getAttribute("data-type") == "microtype-box")) {
        return false;
    }
    let groupBox = event.target;
    let groupid = groupBox.getAttribute("data-groupid")
    addMicroToGroup(groupid, micro.getAttribute("data-micro-type"));
}

//used for moving groups only at the moment
function dropOnInteractionCanvas(event) {
    $('#transition-states-panel').hide();
    let dragged = JSON.parse(event.dataTransfer.getData("text"));
    let dm = document.getElementById(dragged.target); //this is the group box element, we check this below
    if (dm === null || !(dm.getAttribute("data-type") == "group-box")) {
        return false;
    }
    //check bounds for canvas
    if (event.clientX + parseInt(dragged.x, 10) < 0) {
        dm.style.left = 1 + 'px';
    } else {
        dm.style.left = (event.clientX + parseInt(dragged.x, 10)) + 'px';
    }
    if ((event.clientY + parseInt(dragged.y, 10)) < 0) {
        dm.style.top = 1 + 'px';
    } else {
        dm.style.top = (event.clientY + parseInt(dragged.y, 10)) + 'px';
    }

    //TOOD stop from being placed on another group
    var list = document.getElementsByClassName('svg-arrow');
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

function setupInteractionCanvas(){
    var canvas = document.getElementById('interaction-group-canvas');
    canvas.addEventListener("click", function(ev){
        if (controlBtnPressed) {
            //if we click in the canvas and not on a box
            let x = (ev.clientX - canvas.offsetLeft);
            let y = (ev.clientY - canvas.offsetTop);

            addGroupByClick(x,y);
        }
        return false;
    });
}

//==================================creating/adding dom elements -------------------------------------------------------------------
function uuidv4() { //unique id generator
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function newMicroBox(id, type) {
    let microBox = document.createElement("div");
    microBox.classList.add("micro-box");
    microBox.oncontextmenu = rightClickMicro;
    microBox.setAttribute("id", ("microbox" + id));
    microBox.setAttribute("data-type", "micro-box");
    microBox.setAttribute("data-microid", "")//reminder this must be set later for whatever object this box relates to in the database
    microBox.setAttribute("micro-type:", type);
    microBox.addEventListener("click", leftCLickGroupMicro);
    microBox.innerText = type;
    return microBox;
}

function addMicroBoxToGroupView(group, microBox){
    group.appendChild(microBox);
}

function addGroupToView(x,y, groupID){
    var canvas = document.getElementById('interaction-group-canvas');
    var newGroup = document.createElement("div"); 
    newGroup.setAttribute("style", "left: " + x + "px; top: " +  y + "px;");       //
    newGroup.setAttribute("data-type", "group-box");
    newGroup.setAttribute("data-groupid",groupID);
    newGroup.setAttribute("draggable", true);
    newGroup.setAttribute("onDragStart","dragStart(event)");
    newGroup.setAttribute("onDrop","dropOnGroup(event)");
    newGroup.addEventListener("click", clickedGroup)
    newGroup.classList.add("group-box");
    newGroup.classList.add("justify-content-center");
    newGroup.setAttribute("id", uuidv4());
    if(IC.interaction.getGroup(groupID).initialGroup){
        newGroup.classList.add('group-box-initial');
    }
    newGroup.oncontextmenu = rightClickGroup;
    //<input type="text" value="asdf" readonly="true" ondblclick="this.readOnly='';">
    var title = document.createElement("input");
    title.setAttribute("readonly","true");
    title.setAttribute("type", "text");
    title.setAttribute("ondblclick", "this.readOnly='';");
    title.classList.add("group-box-title");
    title.value = IC.interaction.getGroup(groupID).name.replace(/[\W_]+/g, ' ');
    title.addEventListener('keyup', function () {
        IC.interaction.getGroup(groupID).name = title.value; //TODO sterilize input
        title.value=title.value.replace(/[\W_]+/g, ' ');
    });
    newGroup.appendChild(title);
    numBoxes++;
    var interactionCanvas = document.getElementById('interaction-group-canvas');
    interactionCanvas.appendChild(newGroup);
    controlBtnPressed = false;
    applyButtonColor(document.getElementById("newGroupBtn"));
}

function clickedGroup(ev){
    //are we adding transition between two line?
    if (lineBtnPressed) {
        console.log(ev.target);
        if(ev.target.getAttribute("data-type") != "group-box"){
            return;
        }
        if (firstGroupInLine === null) {
            firstGroupInLine = ev.target;
            ev.target.classList.add('group-box-selected');
        } else {
            //draw transition
            secondGroupInLine = ev.target;
            addTransition(firstGroupInLine, secondGroupInLine);
            firstGroupInLine.classList.remove("group-box-selected");
            firstGroupInLine = null;
            lineBtnPressed = false;
            applyButtonColor(document.getElementById("drawLineBtn"));
        }
    }  
}  

function removeGroupFromView(groupToRemove){
    //now remove connected lines
    var list = document.getElementsByClassName('svg-arrow'); //problem with list getting bad data
    const listLength = list.length;
    var linesToRemove = [];
    for(let t=0;t<listLength;t++){
        let svgArrow = list[t];
        if(svgArrow.getAttribute("data-group1") === groupToRemove.id){
            linesToRemove.push(svgArrow);
        }else if(svgArrow.getAttribute("data-group2") === groupToRemove.id){
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
        return; //TODO not supported yet
    }
    var canvas = document.getElementById('interaction-group-canvas');
    var newLine = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    canvas.appendChild(newLine);
    let transitionlineID = uuidv4();
    newLine.setAttribute("id", transitionlineID);
    newLine.classList.add('svg-arrow');
    newLine.setAttribute("data-type", "transition");
    newLine.setAttribute("data-transid",id);
    //newLine.setAttribute("id", "line-" + firstGroup.id + "-" + secondGroup.id);
    newLine.setAttribute("data-group1", firstGroup.id);
    newLine.setAttribute("data-group2", secondGroup.id);

    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    //draw line from nearest edge of first box to nearest edge of second box
    //transitions go from an out point a third of the way down a side of a box to an in point two thirds of the way down the side of a box, with an in point an out point rotated in similar fashion
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

    //todo https://stackoverflow.com/questions/16701522/how-to-linebreak-an-svg-text-within-javascript
    var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.classList.add("arrow-text");
    text.setAttribute("id", uuidv4());
    text.setAttribute("data-lineid", transitionlineID);
    text.setAttribute("x", ((smallest.p2.x + smallest.p1.x) / 2).toString());
    text.setAttribute("y", (((smallest.p2.y + smallest.p1.y) / 2) + 15).toString());
    text.setAttribute("text-anchor", "middle");
    text.oncontextmenu = rightClickTransition;
    let transState = IC.interaction.getTransitionState(id);
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
        if (svgArrow.getAttribute("data-group1") === group.id) {
            linesToRemove.push(svgArrow);
            drawTransition(svgArrow.getAttribute("data-transid"), group, document.getElementById(svgArrow.getAttribute("data-group2")));
            //do move
        } else if (svgArrow.getAttribute("data-group2") === group.id) {
            linesToRemove.push(svgArrow);
 
            drawTransition(svgArrow.getAttribute("data-transid"),document.getElementById(svgArrow.getAttribute("data-group1")), group);
        }
    }

    for (let i = 0; i < linesToRemove.length; i++) {
        document.getElementById("interaction-group-canvas").removeChild(linesToRemove[i]);
    }
}

//updating by the model id not
function updateTransitionByModelTransID(id) { //this is called by the panel controlling transition states
    let transitionText = $("[data-transid=" + id + "]").children('text');
    let transState = IC.interaction.getTransitionState(id);
    let ttm = ""; //transition text message
    ttm += transState.ready ? "Ready " : "";
    ttm += transState.busy ? "Busy " : "";
    ttm += transState.suspended ? "Suspended" : "";
    transitionText.text(ttm);

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




//--------------------------------left and right click on items in canvas=========================
document.onclick = hideMenu;

//left clicks
var curParameterSaved=false; //updates the ui text
function leftCLickGroupMicro(){ 
    //display properties on property sidebar
    $('#parameters-panel').show();
    $('#transition-states-panel').hide();
    $('#no-micros-parameters').hide();
    let selectedMicro = this;
    let micro= IC.interaction.getMicro(this.getAttribute("data-microid"));
    let parameters = micro.parameters;
    let parameterResults = micro.parameterResults;
    let parametersPanel = $('#parameters-panel');
    parametersPanel.empty();
    parametersPanel.append($('<label style="font-size: 17px; border-bottom: 2px solid black;">' +
             ' Parameters ' +
           ' </label >'));
    let row = $('<div class="row"></div>');
    let col = $('<div class="col">');
    let displayedParams = $('<form data-microID=' + selectedMicro.getAttribute("data-microid") + ' onsubmit="saveParameters(\'' + this.id + '-form\')" id="'+this.id+'-form" ></form>');   
    displayedParams.submit(function (e) {
        e.preventDefault();
    });
    parametersPanel.append(displayedParams);

    //parse through each parameter and build a gui representation
    
    parameters.forEach(function(param){
        let curDispParam = $('<div class="parameter" data-type="param" data-paramid = "'+ param.id + '" data-paramType="'+ param.type + '" id="' + selectedMicro.id + "-param" + param.id+ '"></div>');
        if(param.type == "bool"){
            curDispParam.append($('<Label data-type="bool" data-identifier="mainLbl" class="row">' + param.title + '</Label>'));
            let btnYes = $('<input type="radio"  name="p-bool-' + param.id + '" value="true"></input>');
            curDispParam.append(btnYes);
            curDispParam.append($('<label for="p-bool-' + param.id +'">Yes</label><br>'));
            let btnNo = $('<input type="radio"  name="p-bool-' + param.id + '" value="false">');
            curDispParam.append(btnNo);
            curDispParam.append($('<label for="p-bool-' + param.id +'">No</label><br>'));

            if (parameterResults.find(x => x.paramID == param.id).curResult == "true"){
                btnYes.attr("checked", true);
            } else if (parameterResults.find(x => x.paramID == param.id).curResult == "false"){
                btnNo.attr("checked", true);
            }
        }else if(param.type == "str"){
            curDispParam.append($('<Label data-type="str" data-identifier="mainLbl" class="row">' + param.title + '</Label>'));
            let textBox = $('<textarea name="p-field" rows="4" cols="24"></textarea>');
            curDispParam.append(textBox); 
            textBox.text(parameterResults.find(x => x.paramID == param.id).curResult);
        } else if (param.type == "int") {
            curDispParam.append($('<Label data-type="str" data-identifier="mainLbl" class="row">' + param.title + '</Label>'));
            let textBox = $('<textarea name="p-field" rows="1" cols="1"></textarea>');
            curDispParam.append(textBox);
            textBox.text(parameterResults.find(x => x.paramID == param.id).curResult);
        } else if (param.type == "array"){
            curDispParam.append($('<Label style="font-size: 13px" data-type="select" data-identifier="mainLbl" class="row">' + param.title + '</Label>'));
            let textBox = $('<textarea name="p-field" style="font-size:12px" placeholder="Enter the humans response here, then select the state the response should map to and hit add." rows="2" cols="24"></textarea>');
            curDispParam.append(textBox);
            let selections = $('<select class="form-select" style="font-size: 13px; " name="p-array-link"></select>');
            selections.append($('<option val="human_ready">Human Ready</option>'));
            selections.append($('<option val="human_ignore">Human Suspended</option>'));
            curDispParam.append(selections);
            let addBtn = $('<button class="mt-2" style="font-size: 12px" type="button">Add</button>'); //see below for .click()
            curDispParam.append(addBtn);
            curDispParam.append($('<Label style="font-size: 16px" class="row">' + "Current Responses" + '</Label>'));
            let arrayItemsBox = $('<div name="arrayItemBox" class="array-items-box container-fluid px-0"> </div>');
            curDispParam.append(arrayItemsBox);
            addBtn.click(function () { //Add AskItem the list
                if(textBox.val() == ""){
                    return;
                }
                arrayItemsBox.append(createAskListBox(textBox.val(), selections.val())); //add it to the ui, it will be saved to database upon clicking save
                textBox.val('');
            });

            let result = parameterResults.find(x => x.paramID == param.id).curResult;
            if (result != '' && result.length != 0){
                result.forEach(paramObj => {
                    arrayItemsBox.append(createAskListBox(paramObj.val, paramObj.linkTitle));
                });
            }
        }else{
            console.log("ERROR: param type not recognize");
            return;
        }
        displayedParams.append(curDispParam);
    });
    if (parameters.length == 0) {
        parametersPanel.append("<label> No parameters for this micro-interaction</label>")
    }else{
        displayedParams.append($('<button class="mt-2" type="submit">Save</button>'));
    }
   
}

function createAskListBox(response, link){
    let listBox = $('<div data-ltype="container" class = "ask-list-box row"></div>');
    let deleteButton = $('<button style="background-color: red;">X</button>');
    let deleteButtonHolder = $('<div class="col-md-2" ></div>');
    deleteButtonHolder.append(deleteButton);
    let linkText = $('<p data-ltype="link" class="col-md-3" style=" font-size: 10px">'+ link+'</p>');
    let responseText = $('<p data-ltype="response" class="col-md-6 nopadding" style="padding-right:0px; padding-left:5px; font-size: 12px">'+response+'</p>');
    listBox.append(deleteButtonHolder);
    listBox.append(linkText);
    listBox.append(responseText);
    deleteButton.click(function() {
        listBox.remove();
    });
    return listBox;
}


function saveParameters(formId) {
    let form = $('#' + formId + " [data-type='param']");
    let microID = $('#' + formId).attr('data-microid');
    //for every parameter
    let results = [];
    for (let i = 0; i < form.length; i++) {
        let type = form[i].getAttribute('data-paramType');
        let paramID = form[i].getAttribute('data-paramid');
        let curResult = "";
        switch(type){
            case "bool":
                let ele = $('#' + formId + ' [data-paramid="' + paramID + '"] :radio ')
                for (j = 0; j < ele.length; j++) {
                    if (ele[j].checked)
                        curResult = ele[j].value
                }
                break;
            case "str":
                let eleStr = $('#' + formId + ' [data-paramid="' + paramID + '"] :input ')
                curResult = eleStr.val();
                break;
            case "int":
                let eleInt = $('#' + formId + ' [data-paramid="' + paramID + '"] :input ')
                curResult = eleInt.val();
                break;
            case "array":
                
                let eleArr = $('#' + formId + ' [data-paramid="' + paramID + '"] [data-ltype="container"] ');
                curResult = [];
                if (eleArr.length != 0){
                    eleArr.each((index, item) => { //note, item is now html dom object
                        let val = item.childNodes[2].innerText;
                        let link = item.childNodes[1].innerText;
                        curResult.push({ "val": val, "linkTitle": link }) //note the link title must be adapted to proper variable before being sent to database, this is done in export to xml
                    })
                }
        }
        results.push({paramID, curResult});
    }
    IC.interaction.setMicroResults(microID, results);
    let savedLabel = $('<label id="savedLabel" class="save-label mt-2"> Saved </label>');
    console.log("testing");
    console.log($('#parameters-panel').find('#savedLabel'));
    if ($('#parameters-panel').find('#savedLabel').length){
        console.log("contains");
        return;
    }
    $('#parameters-panel').append(savedLabel);
    setTimeout(() => { savedLabel.remove()}, 3000)
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
    let modelTransitionID = e.srcElement.parentNode.getAttribute("data-transid");
    let transitionState = IC.interaction.getTransitionState(modelTransitionID);
    //set checkboxes to current state of this transition
    $('#context-ready').prop('checked', transitionState.ready );
    $('#context-busy').prop('checked', transitionState.busy);
    $('#context-suspended').prop('checked', transitionState.suspended);
    //save current box (which is attatched to the parent line who has the transition id this box is attatched to)
    $('#transition-states-panel').attr('data-cur-text-id', e.srcElement.getAttribute("id")); //cur transition id (the html dom one not the model one)
    $('#transition-states-panel').attr('data-cur-trans-id', modelTransitionID); //cur transition id (the html dom one not the model one)
}

//see 431 todo
function updateTransition(){ //this is called by the panel controlling transition states
    let transitionText = $('#' + $('#transition-states-panel').attr('data-cur-text-id'));
    let transitionModelID = $('#transition-states-panel').attr('data-cur-trans-id');
    let transitionModelBackground = transitionText.parent().find('rect');
    console.log(transitionModelBackground);
    let rect = $('#' + $('#transition-states-panel').attr('data-curtid') + ' rect'); //transition texts background
    let stateReady = $('#context-ready').prop('checked');
    let stateBusy = $('#context-busy').prop('checked');
    let stateSuspended = $('#context-suspended').prop('checked');
    let transitionState = { ready: stateReady, busy: stateBusy, suspended: stateSuspended};
    let ttm = "" ; //transition text message
    ttm += stateReady ? "Ready " : "";
    ttm += stateBusy ? "Busy " : "";
    ttm += stateSuspended ? "Suspended" : "";
    console.log(ttm);
    IC.interaction.setTransitionState(transitionModelID, transitionState);
    transitionText.text(ttm);

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





//right clicks==========

function hideMenu(e) {
    //right click menues hide
    document.getElementById("contextMenuGroup").style.display = "none";
    document.getElementById("contextMenuMicro").style.display = "none";   
    document.getElementById("contextMenuTransition").style.display = "none";
}

function rightClickTransition(e) {
    e.preventDefault();
    if (document.getElementById("contextMenuTransition")
        .style.display == "block")
        hideMenu();
    else {
        var menu = document.getElementById("contextMenuTransition");
        let parentid = e.target.getAttribute("data-lineid");
        document.getElementById("removeTransitionBtn").setAttribute('value', parentid);
        menu.style.display = 'block';
        menu.style.left = e.pageX + "px";
        menu.style.top = e.pageY + "px";
    }
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
        console.log(e);
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
