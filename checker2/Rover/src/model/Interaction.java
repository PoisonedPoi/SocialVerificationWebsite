package model;
import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import aCheck.*;
import checkers.Checker;
import checkers.PrismThread;
import checkers.Property;

import aCheck.ModelFileChecker;
import controller.NetworkPropagator;
import model_ctrl.Decoder;
import model_ctrl.MicroParameterizer;
import model_ctrl.TooltipViz;
import study.BugTracker;

/*
 * Class Interaction:
 * Stores the entire interaction, including all microinteractions.
 */
public class Interaction { 
	// model checker for the interaction
	private Checker c;
	
	// initialized immediately
	private String name;
	private ArrayList<Group> groups;
	private ArrayList<Microinteraction> microinteractions;   // simple list of microinteractions
	private HashMap<Integer,Microinteraction> ID2Micro;      // maps ID to microinteraction
	private HashMap<String,Microinteraction> Name2Micro;      // maps ID to microinteraction
	private HashMap<Integer, Group> ID2Group;      // maps ID to microinteraction
	private HashMap<String, Group> Name2Group;      // maps ID to microinteraction
	
	// initilized after reading supreme.xml
	private ArrayList<GroupTransition> transitions;            // transitions between microinteractions
	private ArrayList<Variable> globals;
	private Group init;
	
	// flags
	private boolean built;
	
	// properties
	private ArrayList<Property> graphProperties;
	private HashMap<Integer, java.lang.Boolean> graphPropertyValues;
	
	// bugs
	private boolean authProp;
	private boolean farewellProp;
	
	// Bug tracking
	private BugTracker bugtrack;

	// the network propagation algorithm
	private NetworkPropagator networkPropagator;
	
	// experiment stuff
	private String currDesign;
	private int currInstruction;
	private java.lang.Boolean tutorial;
	
	// color picking
	private int colorPickerIdx;
	
	// is copy
	private boolean isCopy;
	
	// static enders
	private HashMap<String, java.lang.Boolean[]> staticEnders;
	
	
	// isNonAssisted
	private Boolean isNonAssisted;

	//the violations the checker finds
	private HashMap<Property, Violation> violations;
	private HashMap<String, Violation> specialViolations; //indexed by string instead of property

	//has the user folder location (SHOULD NOT BE CHANGED AFTER SET)
	private String USERFOLDER;

	public Interaction(ArrayList<Property> properties) {
		this.graphProperties = properties;
		initialize();
	}
	
	public Interaction(ArrayList<Microinteraction> micros, ArrayList<Property> properties) {
		this.graphProperties = properties;
		Collections.sort(this.graphProperties);
		initialize();
		for (Microinteraction m : micros) {
			addMicro(m);
		}
	}
	
	public void initialize() {
		isCopy = false;
		c=null;
		built=false;
		groups = new ArrayList<Group>();
		microinteractions = new ArrayList<Microinteraction>();
		ID2Micro = new HashMap<Integer,Microinteraction>();
		Name2Micro = new HashMap<String,Microinteraction>();
		ID2Group = new HashMap<Integer, Group>();
		Name2Group = new HashMap<String, Group>();
		
		staticEnders = new HashMap<String, java.lang.Boolean[]>();
		
		violations = new HashMap<Property, Violation>();
		specialViolations = new HashMap<String, Violation>();
		authProp = true;
		farewellProp = true;
		currDesign = null;
		currInstruction = -1;
		tutorial = false;
		
		// properties
		graphPropertyValues = new HashMap<Integer, java.lang.Boolean>();
		for (Property prop : graphProperties) {
			if (prop.getTies().equals("interaction")) {
				graphPropertyValues.put(prop.getID(), prop.getInitVal());
			}
		}

		// bug tracker
		bugtrack = null;

		networkPropagator = new NetworkPropagator(bugtrack);
	}

	public void startDesign( ModelFileChecker mainController) {
		for (Group group : this.getGroups()) {
			for (Microinteraction micro : group.getMicrointeractions()) {
				this.addMicro(micro);
				PrismThread pt = new PrismThread( this, mainController, micro);
				Thread t = pt.getThread();
				pt.start("startEndStates");
				try {
					t.join();
				} catch (InterruptedException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
		}
	}

	//this is the main class used for violation parsing
	public Document getXMLViolationDocument(){
		DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
		DocumentBuilder dBuilder;
		try{
			dBuilder = dbFactory.newDocumentBuilder();
			Document document = dBuilder.newDocument();
			Element rootElement = document.createElement("violation_list");
			document.appendChild(rootElement);
			
			//print violation list, go through all the property categores and if a violation exists for that category then we add a violation xml object 
			for(Property prop : graphProperties){ //parsing all properties, the special violations are below
				if(prop.getTies().equals("group") || prop.getTies().equals("init")){
					if(violations.get(prop) != null){
						Element violationElement = document.createElement("violation");

						Element category = document.createElement("category");
						category.appendChild(document.createTextNode("group"));
						violationElement.appendChild(category);

						Element type = document.createElement("type");
						
						type.appendChild(document.createTextNode(violations.get(prop).getType()));
						violationElement.appendChild(type);

						Element description = document.createElement("description");
						description.appendChild(document.createTextNode(violations.get(prop).propDesc()));
						violationElement.appendChild(description);

						Element violationGroupsElement = document.createElement("violator_groups");
						ArrayList<Group> violatorGroups = violations.get(prop).getGroupsViolating();
						for(int i=0;i<violatorGroups.size();i++){
							Element curGroupElement = document.createElement("group");
							curGroupElement.appendChild(document.createTextNode(violatorGroups.get(i).getName()));
							violationGroupsElement.appendChild(curGroupElement);
						}
						violationElement.appendChild(violationGroupsElement);
						rootElement.appendChild(violationElement);
					}
				}else if(prop.getTies().equals("interaction")){
					if(violations.get(prop) != null){
						Element violationElement = document.createElement("violation");

						Element category = document.createElement("category");
						category.appendChild(document.createTextNode("interaction"));
						violationElement.appendChild(category);

						Element type = document.createElement("type");
						type.appendChild(document.createTextNode(violations.get(prop).getType()));
						violationElement.appendChild(type);

						Element description = document.createElement("description");
						description.appendChild(document.createTextNode(violations.get(prop).propDesc()));
						violationElement.appendChild(description);
						rootElement.appendChild(violationElement);
					}
				}
			}
			specialViolations.forEach((violationType, violation) -> {
				if(violation.isViolatingAtGroupLevel()){
					Element violationElement = document.createElement("violation");

					Element category = document.createElement("category");
					category.appendChild(document.createTextNode("group"));
					violationElement.appendChild(category);

					Element type = document.createElement("type");
					
					type.appendChild(document.createTextNode(violationType));
					violationElement.appendChild(type);

					Element description = document.createElement("description");
					description.appendChild(document.createTextNode(violation.getDescription()));
					violationElement.appendChild(description);

					Element violationGroupsElement = document.createElement("violator_groups");
					ArrayList<Group> violatorGroups = violation.getGroupsViolating();
					for(int i=0;i<violatorGroups.size();i++){
						Element curGroupElement = document.createElement("group");
						curGroupElement.appendChild(document.createTextNode(violatorGroups.get(i).getName()));
						violationGroupsElement.appendChild(curGroupElement);
					}
					violationElement.appendChild(violationGroupsElement);
					rootElement.appendChild(violationElement);
				}else if(violation.isViolatingAtInteractionLevel()){
					Element violationElement = document.createElement("violation");

					Element category = document.createElement("category");
					category.appendChild(document.createTextNode("interaction"));
					violationElement.appendChild(category);

					Element type = document.createElement("type");
					type.appendChild(document.createTextNode(violationType));
					violationElement.appendChild(type);

					Element description = document.createElement("description");
					description.appendChild(document.createTextNode(violation.getDescription()));
					violationElement.appendChild(description);
					rootElement.appendChild(violationElement);
				}
			});
			return document;
		}catch(Exception e){
			e.printStackTrace();
		}
		return null;
	}

	public String getUSERFOLDER(){
		return USERFOLDER;
	}

	public void setUSERFOLDER(String USERFOLDER){
		this.USERFOLDER = USERFOLDER;
	}
	
	public Checker getChecker() {
		return c;
	}
	
	public void setIsCopy(boolean val) {
		isCopy = val;
	}
	
	public boolean getIsCopy() {
		return isCopy;
	}
	
	public void nullifyChecker() {
		c = null;
	}
	
	public void setNonAssistedSwitch(Boolean val) {
		isNonAssisted = val;
	}
	
	public boolean getIsNonAssisted() {
		return isNonAssisted;
	}
	
	public void setChecker(Checker c, ModelFileChecker mc) {
		this.c = c;
		//c.switchEngine("explicit");

		isNonAssisted = mc.getNonAssistedSwitch();
		//HashMap<String, TooltipViz> staticTooltips = mc.getStaticTooltips();
		// if isNonAssisted, get static images of the start and end states 
		if (true ) {
			
			// we need to one-at-a-time add each microinteraction to init, and calculate the visualization\
			Decoder d = new Decoder(mc, isNonAssisted);
			ArrayList<Microinteraction> micros = new ArrayList<Microinteraction>();
			Microinteraction m;
			// greeter

			m = new Microinteraction(); //
			d.readMicrointeraction(new File(Globals.ROOT_FP + "/resources/" +"Lib/Initiate/Greeter.xml"), Globals.ROOT_FP + "/resources/"+"Lib/Initiate/Greeter.xml", m);
			micros.add(m);


			// farewell
			m = new Microinteraction();
			d.readMicrointeraction(new File(Globals.ROOT_FP + "/resources/" +"Lib/End/Farewell.xml"), Globals.ROOT_FP + "/resources/" +"Lib/End/Farewell.xml", m);
			micros.add(m);
			// inst_action
			m = new Microinteraction();
			d.readMicrointeraction(new File(Globals.ROOT_FP + "/resources/" +"Lib/Task_Instruction/Instruction.xml"), Globals.ROOT_FP + "/resources/" +"Lib/Task_Instruction/Instruction.xml", m);
			micros.add(m);
			// handoff
			m = new Microinteraction();
			d.readMicrointeraction(new File(Globals.ROOT_FP + "/resources/" +"Lib/Joint_Action/Handoff.xml"), Globals.ROOT_FP + "/resources/" + "Lib/Joint_Action/Handoff.xml", m);
			micros.add(m);
			// comment
			m = new Microinteraction();
			d.readMicrointeraction(new File(Globals.ROOT_FP + "/resources/" +"Lib/Remark/Remark.xml"), Globals.ROOT_FP + "/resources/" +"Lib/Remark/Remark.xml", m);
			micros.add(m);
			// wait
			m = new Microinteraction();
			d.readMicrointeraction(new File(Globals.ROOT_FP + "/resources/" +"Lib/Wait/Wait.xml"), Globals.ROOT_FP + "/resources/" +"Lib/Wait/Wait.xml", m);
			micros.add(m);
			// question
			m = new Microinteraction();
			d.readMicrointeraction(new File(Globals.ROOT_FP + "/resources/" +"Lib/Ask/Ask.xml"),Globals.ROOT_FP + "/resources/" + "Lib/Ask/Ask.xml", m);
			micros.add(m);
			// answer
			m = new Microinteraction();
			d.readMicrointeraction(new File(Globals.ROOT_FP + "/resources/" +"Lib/Answer/Answer.xml"),Globals.ROOT_FP + "/resources/" + "Lib/Answer/Answer.xml", m);
			micros.add(m);
			
			for (Microinteraction micro : micros) {
				micro.build();
			//	micro.addParameterizer(new MicroParameterizer(micro.getGlobalVars(), mc));
				PrismThread pt = new PrismThread( this, mc, micro);
				Thread t = pt.getThread();
				pt.start("startEndStates");
				try {
					t.join();
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
				
				//TooltipViz staticVis = (TooltipViz) micro.getTooltipViz();
				//java.lang.Boolean[] enders = staticVis.draw(isNonAssisted);
				//staticEnders.put(micro.getName(), enders);
				//staticTooltips.put(micro.getName(), staticVis);
			}
		}
	}
	
	public void initializeInteraction() {
		transitions = new ArrayList<GroupTransition>();
	}

	public void printViolations(){
		System.out.println("\n\n\n Printing all violations \n");

		System.out.println("Printing Group Violations");
		for(Property prop : graphProperties){
			if(prop.getTies().equals("group") || prop.getTies().equals("init")){
				if(violations.get(prop) != null){
					System.out.println(violations.get(prop).toString() + "\n");
				}
			}
		}
		System.out.println("Printing Interaction Violations");
			for(Property prop : graphProperties){
				if(prop.getTies().equals("interaction")){
					if(violations.get(prop) != null){
						System.out.println(violations.get(prop).toString() +"\n");
					}
				}
			}
	}

	public void clearViolations(){
		//TODO clear violations
		//violations.clear();
	}

	public void addSpecialViolation(Violation v){
		specialViolations.put(v.getType(), v);
	}

	public boolean hasSpecialViolation(String type){
		return specialViolations.containsKey(type);
	}

	public Violation getSpecialViolation(String type){
		return specialViolations.get(type);
	}

	public void addViolation(Violation v){
		violations.put(v.getProperty(), v);
	}

	public boolean hasViolationForProperty(Property prop){
		return violations.containsKey(prop);
	}

	public Violation getViolation(Property p){
		return violations.get(p);
	}

	public HashMap<Property, Violation> getViolations(){
		return violations;
	}

	public java.lang.Boolean[] getStaticEnders(String microName) {
		return staticEnders.get(microName);
	}
	
	public void setCurrDesign(String design) {
		this.currDesign = design;
	}
	
	public String getCurrDesign() {
		return currDesign;
	}
	
	public void setCurrInstruction(int inst) {
		this.currInstruction = inst;
	}
	
	public int getCurrInstruction() {
		return this.currInstruction;
	}
	
	public void setTutorial(boolean val) {
		this.tutorial = val;
	}
	
	public boolean getTutorial() {
		return tutorial;
	}
	
	public ArrayList<Property> getGraphProperties() {
		return graphProperties;
	}
	
	public HashMap<Integer, java.lang.Boolean> getGraphPropertyValues() {
		return graphPropertyValues;
	}
	
	public void addMicro(Microinteraction m) {
		microinteractions.add(m);
		if (m.getID() >= 0)
			ID2Micro.put(m.getID(), m);
		Name2Micro.put(m.getName(), m);
		//m.getMicroBox().setMBColor(colorPick(m));
	}
	
	public void addGroup(Group group) {
		groups.add(group);
		group.addInteraction(this);
		if (group.getID() >= 0)
			ID2Group.put(group.getID(), group);
		Name2Group.put(group.getName(), group);
	}
	
	public void updateMicroID(Microinteraction m) {
		ID2Micro.put(m.getID(), m);
	}
	
	public void updateGroupID(Group group) {
		ID2Group.put(group.getID(), group);
	}
	
	public void setInit(Group init) {
		this.init = init;
	}
	
	public void addTransition(Group source, Group target) {
		transitions.add(new GroupTransition(source,target, bugtrack));
	}
	
	public void addTransition(GroupTransition mac) {
		transitions.add(mac);
	}
	
	public void updateAllAndDisplayConditions() {
		for (GroupTransition mt : transitions) {
			mt.unGray();
			mt.updateAndDisplayConditions(); 
		}
	}
	
	public Microinteraction getMicro(int ID) {
		return ID2Micro.get(ID);
	}
	
	public Microinteraction getMicro(String name) {
		if (Name2Micro.get(name) == null) {
			//System.out.println(name + " does not exist as a microinteraction!");
			return null;
		}
		return Name2Micro.get(name);
	}
	
	public ArrayList<Microinteraction> getMicros() {
		return microinteractions;
	}
	
	public Group getGroup(int ID) {
		return ID2Group.get(ID);
	}
	
	public Group getGroup(String name) {
		if (Name2Group.get(name) == null) {
			//System.out.println(name + " does not exist as a Group!");
			return null;
		}
		return Name2Group.get(name);
	}
	
	public ArrayList<Group> getGroups() {
		return groups;
	}
	
	public ArrayList<GroupTransition> getMacroTransitions() {
		return transitions;
	}
	
	public BugTracker getBugTracker() {
		return bugtrack;
	}

	public void addBugTracker(BugTracker bugtrack) {
		this.bugtrack = bugtrack;
	}

	public void killBugTracker(String name) {
		bugtrack.kill(name);
	}

	public void makeBugtrackerNull() {
		bugtrack = null;
	}

	public NetworkPropagator getNetworkPropagator() {
		return networkPropagator;
	}

	public void reinitializeBugTracker() {
		bugtrack = new BugTracker(this);
		c.addBugTracker(bugtrack);
		networkPropagator = new NetworkPropagator(bugtrack);
		for (Group group : getGroups()) {
			group.addBugTracker(bugtrack);
		}
		for (GroupTransition mt : getMacroTransitions()) {
			mt.addBugTracker(bugtrack);
		}
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getName() {
		return name;
	}
	
	public void setAuthProp(boolean val) {
		if (this.authProp != val && val == true)
			bugtrack.removeBug("authProp", this);
		else if (this.authProp != val && val == false)
			bugtrack.addBug("authProp", this);
		authProp = val;
	}
	
	public boolean getAuthProp() {
		return authProp;
	}
	
	public void setFarewellProp(boolean val) {
		if (this.farewellProp != val && val == true)
			bugtrack.removeBug("farewellProp", this);
		else if (this.farewellProp != val && val == false)
			bugtrack.addBug("farewellProp", this);
		farewellProp = val;
	}
	
	public boolean getFarewellProp() {
		return farewellProp;
	}
	
	// graph properties
	public void setProp(Property prop, boolean val) {

		//System.out.println("interaction graph property set                                                          hey look here");
		if (prop.getTies().equals("init")) {
			getInit().setGraphProp(prop,val);
			//System.out.println("******************INIT: " + getInit().getName() + ": greeter satisfied? " + val);
		}
		else {
			boolean propVal = graphPropertyValues.get(prop.getID());
			String propBugID = prop.getBugtrackID();
			if (propVal != val && val == true) {
				//bugtrack.removeGraphBug(prop, null);
			}
			else if (propVal != val && val == false) {
			//	bugtrack.addGraphBug(prop, null);
			}
			graphPropertyValues.put(prop.getID(), val);
		}
	}
	
	public boolean getProp(Property prop) {
		return graphPropertyValues.get(prop.getID());
	}
	
	public boolean isViolatingBranch() {
		boolean violation = false;
		for (Group group : groups) {
			if (!group.checkBranchingPartition()[1]) {
				violation = true;
				break;
			}
		}
		return violation;
	}
	
	public boolean isViolatingSequential() {
		boolean violation = false;
		for (GroupTransition mt : transitions) {

			ArrayList<ArrayList<Microinteraction>> badConnections = mt.getBadConnections();
			if (!badConnections.isEmpty()) {
				violation = true;
				break;
			}
		}
		return violation;
	}
	
	public boolean isViolatingSomething() {
		if (!farewellProp || !authProp || !getInit().getGreetingProp() || isViolatingBranch() || isViolatingSequential()) {
			return true;
		}
		return false;

	}
	
	public void setBuilt(boolean val) {
		built = val;
	}
	
	public boolean[] obtainStarters(Group group) {
		boolean anyReady = false;
		boolean anyBusy = false;
		boolean anyIgnore = false;
		
		boolean readyAvailable = true;
		boolean busyAvailable = true;
		boolean ignoreAvailable = true;
		
		for (Microinteraction micro : group.getMicrointeractions()) {
			boolean[] endStates = micro.getHumanStartStates();
			if (endStates[0])
				anyReady = true;
			else
				readyAvailable = false;
			if (endStates[1])
				anyBusy = true;
			else
				busyAvailable = false;
			if (endStates[2])
				anyIgnore = true;
			else
				ignoreAvailable = false;
		}
		
		
		
		boolean[] aggregate = {anyReady, anyBusy, anyIgnore, readyAvailable, busyAvailable, ignoreAvailable};
		return aggregate;
	}
	

	
	public boolean testIsCyclic() {
		ArrayList<Group> groupsToTraverse = new ArrayList<Group>();
		groupsToTraverse.add(init);
		ArrayList<Group> seen = new ArrayList<Group>();
		
		boolean cycle = false;
		
		while (!groupsToTraverse.isEmpty()) {
			Group curr = groupsToTraverse.get(0);
			groupsToTraverse.remove(0);
			if (seen.contains(curr)) {
				cycle = true;
				break;
			}
			
			seen.add(curr);
			
			for (GroupTransition macro : curr.getOutputMacroTransitions()) {
				groupsToTraverse.add(macro.getTarget());
			}
		}
		
		return cycle;
	}
	
	
	
	
	
	public String toString() {
		String str = "INTERACTION: " + this.name + "\n";
		
		for (Group group : groups)
			str += group.toString();
		
		return str;
	}

	public Group getInit() {
		return init;
	}
	
	public Interaction copy() {
		// init the interaction and load up the properties
		Interaction iaCopy = new Interaction(graphProperties);
		BugTracker btCopy = new BugTracker(iaCopy);
		iaCopy.initializeInteraction();
		
		// handle everything that got initialized from the get-go
		/*
		built = false
		groups = new ArrayList<Group>();
		microinteractions = new ArrayList<Microinteraction>();
		ID2Micro = new HashMap<Integer,Microinteraction>();
		Name2Micro = new HashMap<String,Microinteraction>();
		ID2Group = new HashMap<Integer, Group>();
		Name2Group = new HashMap<String, Group>();
		
		authProp = true;
		farewellProp = true;
		
		// properties
		graphPropertyValues = new HashMap<Integer,Boolean>();
		for (Property prop : graphProperties) {
			if (prop.getTies().equals("interaction")) {
				graphPropertyValues.put(prop.getID(), prop.getInitVal());
			}
		}
		*/
		//built
		iaCopy.setBuilt(true);
		
		// do the microcollections and the microinteractions at the same time
		for (Group group : groups) {
			Group newGroup = group.copy();
			iaCopy.addGroup(newGroup);
			if (group.isInit()) {
				iaCopy.setInit(newGroup);
			}
			
			for (Microinteraction micro : newGroup.getMicrointeractions()) {
				iaCopy.addMicro(micro);
			}
		}
						
		// do we need to set any of the properties? I don't think so.
		
		// link the properties
		for (Group group : iaCopy.getGroups()) {
			group.addInteraction(iaCopy);
			group.addBugTracker(btCopy);
		}
		
		// now... go through the macrotransitions
		for (GroupTransition macro : transitions) {
			Group source = iaCopy.findGroup(macro.getSource().getName());
			Group target = iaCopy.findGroup(macro.getTarget().getName());
			
			GroupTransition newMacro = macro.copy(source, target);
			newMacro.addBugTracker(btCopy);
			iaCopy.addTransition(newMacro);
		}
		
		iaCopy.addBugTracker(btCopy);
		
		iaCopy.setIsCopy(true);
		
		return iaCopy;
	}
	
	// to help with copying
	public Group findGroup(String name) {
		return Name2Group.get(name);
	}
}
