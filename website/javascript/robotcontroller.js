
var robot;
//this executes as soon as the client loads the page
$(window).load(function () {
    // executes when complete page is fully loaded, including all frames, objects and images
    robot = new robotInterface(); //use let for local variables and var for global variables
});


//think of these as driver methods that correlate to the test buttons
function doArmUp(){
    robot.moveArmUp();
}

function doArmDown(){

}


