package aCheck;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

import checkers.Conflict;
import checkers.ModBehPair;
import checkers.Property;

import model.Group;
import model.GroupTransition;
import model.Interaction;
import model.Module;

//this class parses the interaction and the groups to find the violations and their properties
public class ViolationParser{ 

	private ModelFileChecker mc;
	private Interaction ia;
	
	Conflict noMicrosInInit;
	HashMap<Integer,Conflict> graphPropIAConflictLookup;
	ArrayList<String> addedPropertyCategories;
	
	
    public ViolationParser(Interaction ia, ArrayList<String> propertyCategories, ModelFileChecker mc) {
		this.ia = ia;
		this.mc = mc;
		//System.out.println("**********violation class created *******");
		noMicrosInInit = new Conflict(null, "Initial state contains no microinteractions.", "nofix", null, null,null,null);//carried over from first version
		graphPropIAConflictLookup = new HashMap<Integer,Conflict>();
		//System.out.println("graphProperties");
		for (Property prop : ia.getGraphProperties()) {
			//System.out.println("ties is " + prop.getTies() + " and " + prop.getContext());
			if (prop.getTies().equals("interaction")) {
				//graphPropIAConflictLookup.put(prop.getID(),conf);
			}
		}
		this.addedPropertyCategories = new ArrayList<String>();


	}
		
	public void update() {
		//System.out.println("*************** doing update (or check as we are using it)s *** *************");

		addedPropertyCategories.clear();
		if (mc.getNonAssistedSwitch()) {
			for (Group group : ia.getGroups())
				addGazeGestureConflicts(group);

			return;
		}
		//System.out.println("starting to look at property violations");
		// look at all property violations
		if (ia.getInit().getMicrointeractions().isEmpty()) {
            //System.out.println("no micros violation");

		}
		else {

           // System.out.println("checking interaction properties");
			if (!ia.getAuthProp() && ia.getCurrDesign().equals("Delivery")) {
				//Note for delivery focused designs we should create a violation here
				//This is an example of what it may look like

				//Violation deliveryViolation = new Violation("delivery Errors", true, " conditions insufficient");
				//ia.addSpecialViolation(branchViolation);

				//System.out.println("Interaction violating delivery");
			}
			
			if (ia.isViolatingBranch()) {
				if (!addedPropertyCategories.contains("Branching Errors")) {
					//System.out.println("Interaction violating branch");
					addedPropertyCategories.add("Branching Errors");
					//root.getChildren().add(propertyCategories.get("Branching Errors"));
				}
				if(!ia.hasSpecialViolation("Branching Errors")){ 
						Violation branchViolation = new Violation("Branching Errors", true, "Branch conditions insufficient");
						ia.addSpecialViolation(branchViolation);
					}else{
						//violation already added
					}	
				// Old refernece to a conflict here -->   propertyCategories.get("Branching Errors").getChildren().add(new Conflict(null, "Branch conditions insufficient (See grayed-out transitions. Are you using else statements appropriately?).", "ia", null, null, null, null));
			}
			if (ia.isViolatingSequential()) {
				//System.out.println("Interaction violating sequential");
				if (!addedPropertyCategories.contains("Jams")) {
					addedPropertyCategories.add("Jams");
				}
					if(!ia.hasSpecialViolation("Jams")){
						Violation jamViolation = new Violation("Jams", true, "Sequential composition of groups insufficient (see transitions with red or yellow indicators)");
						ia.addSpecialViolation(jamViolation);
					}else{
						//violation already added
					}	
			
			}
			//System.out.println("finished checking interaction properties");
			HashMap<Integer,Boolean> graphPropertyValues;
			
			/*
			 * Group-specific proeprties
			 */

            //System.out.println("checking group property");

			for (Group group : ia.getGroups()) { //this is how original code was ported, this should be refactored to allow other special violations in the future
				if (group.getViolating()) {
					if (!addedPropertyCategories.contains("Speech Flubs")) {
						addedPropertyCategories.add("Speech Flubs");
					
					}

					if(!ia.hasSpecialViolation("Speech Flubs")){
						Violation speechViolation = new Violation("Speech Flubs", false, "Robot may interrupt the human's speech");
						speechViolation.addGroupViolating(group);
						ia.addSpecialViolation(speechViolation);
					}else{
						ia.getSpecialViolation("Speech Flubs").addGroupViolating(group);
					}	
				}
				


					
				//System.out.println("	checking all properties to see if violation happened in group");
				graphPropertyValues = group.getGraphPropertyValues();
				for (Property prop : ia.getGraphProperties()) {
					if (prop.getTies().equals("group") || prop.getTies().equals("init")) { //check all group specific properties
						//System.out.println("		checking Property" + prop.toString() );
						// if the property if violated
						if (!graphPropertyValues.get(prop.getID())) { //it returns false if a property is violated
							//System.out.println("		property was violated" + " and desc " + prop.getDescription());
							if(ia.hasViolationForProperty(prop)){
								Violation violater = ia.getViolation(prop);
								violater.addGroupViolating(group);
							}else{
								Violation violater = new Violation(prop);
								violater.addGroupViolating(group);
								ia.addViolation(violater);
							}

							// if the list of group property categories does not already contain this one, add it
							if (!addedPropertyCategories.contains(prop.getCategory())) {
								addedPropertyCategories.add(prop.getCategory());
							}
						}
					}
				}
				
				// get list of modules
				//System.out.println("Now getting list of modules");
			//	addGazeGestureConflicts(group); --note this is how we catch gesture and gaze conflicts
			}

			/*
			 * interaction-specific properties
			 */

			//here we add violations to be parse
			graphPropertyValues = ia.getGraphPropertyValues();
			for (Property prop : ia.getGraphProperties()) {
				if (prop.getTies().equals("interaction")) {
					//System.out.println("		checking Property" + prop.toString());
					if (!graphPropertyValues.get(prop.getID())) {
						
						//System.out.println("		Violation found");
						//System.out.println(prop.toString()  + " and desc " + prop.getDescription());
						ia.addViolation(new Violation(prop));

						if (!addedPropertyCategories.contains(prop.getCategory())) {
							addedPropertyCategories.add(prop.getCategory());
				
						}
					}
				}
			}
		}
	}
	
	public void addGazeGestureConflicts(Group group) {
		//System.out.println(" *********** adding gaze gester conflict **********");
		ArrayList<Module> allMods = group.getMacrointeraction().getModules();
		
		for (ModBehPair mbp : group.allRelevantBehaviorConflicts(allMods)) {
			String desc = "";
			if (mbp.getFix() != null) 
				desc += "(RESOLVED) ";
				
			desc += "In " + group.getName() + ", robot might use ";
			
			ArrayList<String> behaviors = new ArrayList<String>();
			for (int i = 0; i < mbp.size(); i++) {
				desc += mbp.getBeh(i) + " in " + mbp.getMod(i).getName();
				String beh = mbp.getBeh(i);
				if (!behaviors.contains(beh))
					behaviors.add(beh);
				
				if (i >= mbp.size()-1);
				else
					desc += " and ";
			}
			
			desc += " at the same time.";
			
			//root.getChildren().add(new Conflict(null, desc, (mbp.getFix() == null)?"canfix":"fix", behaviors, mbp, group, mc));
		}
	}

}



