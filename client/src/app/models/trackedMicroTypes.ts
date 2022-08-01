import { MicroType } from "./microType";
import { Parameter } from "./parameter";

export function getTrackedMicroTypes(): MicroType[] {
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

  return microTypes;
}
