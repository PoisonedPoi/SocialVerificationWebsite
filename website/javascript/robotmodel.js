
class robotInterface {
    //note use this.varname to access or use any variable OR METHOD you declare in this class
    //google how to use javascript classes for more detail

    /* global class variables are,
    robotdiv (reference to the div we are working in, add the pictures in here)
    armStates (the list of possible arm states and the pictures/frames that represent them)
    headStates (the list of possible head states and the pictures/frames that represent them)
    currentArmState (the current arm state)
    currentHeadState (the current head state)
    */



    constructor() {
        this.robotdiv = document.getElementById("robot-view");
        //this is now a global variable in the class, whenever we use this. it tries to refer to a global variable in the class, local variables are just normal varName and must be declared in scope
        this.armStates = [{ name: "armup", pictureID: 1 }, { name: "armdown", pictureID: 2 }, { name: "armneutral", pictureID: 3 }];
        this.headStates = [{ name: "... ", pictureID: 0 }];// and similar pattern for next
        this.currentArmState = "armneutral";
        this.currentHeadState = "headneutral";
    }


    repaint() {
        let armPicID = this.getArmPictureID();
        //display armPicture with correlating picture id in the div

        //let headPicID = this.getHeadPicID();
        //display headPicture with correlating picture id ontop of previous image, or whatever order you want

        //etc..
    }

    moveArmUp() {
        //TODO refresh arm state to be arm up
        this.currentArmState = "armup";
        this.repaint(); //its this.repaint() becuase we define repaint in this class, to call it outside this class we would make an object of it like we would in java
        //like var rI = new robotInterface() ;  (then)  rI.repaint();

        console.log("did arm up");
    }


    getArmPictureID() {
        for (let i = 0; i < this.armStates.length; i++) {
            if (this.armStates[i].name == this.currentArmState) {
                return this.armStates[i].pictureID;
            }
        }
        console.log("ERROR: arm state not recognized");
    }

}