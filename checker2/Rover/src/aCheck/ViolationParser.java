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


public class ViolationParser{ //this class parses the interaction and the groups to find the violations and their properties

	private ModelFileChecker mc;
	private Interaction ia;
	
	// conflicts
	//Conflict greeting;
	//Conflict farewell;
	Conflict noMicrosInInit;
	HashMap<Integer,Conflict> graphPropIAConflictLookup;
	HashMap<Group,HashMap<Integer,Conflict>> graphPropGroupConflictLookup;
	HashMap<String,Conflict> propertyCategories;
	ArrayList<String> addedPropertyCategories;
	
	
    public ViolationParser(Interaction ia, ArrayList<String> propertyCategories, ModelFileChecker mc) {
		this.ia = ia;
		this.mc = mc;
		//System.out.println("**********violation class created *******");
		//test
		noMicrosInInit = new Conflict(null, "Initial state contains no microinteractions.", "nofix", null, null,null,null);
		graphPropIAConflictLookup = new HashMap<Integer,Conflict>();
		//System.out.println("graphProperties");
		for (Property prop : ia.getGraphProperties()) {
			//System.out.println("ties is " + prop.getTies() + " and " + prop.getContext());
			if (prop.getTies().equals("interaction")) {
				Conflict conf = new Conflict(prop, ((prop.getContext() != null)?(prop.getContext() + ", "):"") + prop.getDescription(), "nofix", null, null, null, null);
				graphPropIAConflictLookup.put(prop.getID(),conf);
			}
		}
		graphPropGroupConflictLookup = new HashMap<Group,HashMap<Integer,Conflict>>();
		this.propertyCategories = new HashMap<String,Conflict>();
		this.addedPropertyCategories = new ArrayList<String>();
		
		//System.out.println(" printing property categories");
		for (String str : propertyCategories) {
			//System.out.println("read " + str + " in propertyCategories violation pane");
			this.propertyCategories.put(str, new Conflict(null, str, "nofix", null, null, null, null));
		}
		//root = new TreeItem("Property Violations");
       

	}
		
	public void update() {
		//System.out.println("*************** doing update (or check as we are using it)s *** *************");
		Iterator it = propertyCategories.entrySet().iterator();

		// while (it.hasNext()) {
		// 	HashMap.Entry pair = (HashMap.Entry)it.next();
		// 	((Conflict) pair.getValue()).getChildren().clear();
		// }
		// root.getChildren().clear();
		addedPropertyCategories.clear();
		if (mc.getNonAssistedSwitch()) {
			for (Group group : ia.getGroups())
				addGazeGestureConflicts(group);

            //System.out.println("violation return 1");
			return;
		}
		//System.out.println("starting to look at property violations");
		// look at all property violations
		if (ia.getInit().getMicrointeractions().isEmpty()) {
            //System.out.println("early violation");
			//root.getChildren().add(noMicrosInInit);
			//tv.add(noMicrosInInit);
		}
		else {
			//tv.remove(noMicrosInInit);
           // System.out.println("checking interaction properties");
			if (!ia.getAuthProp() && ia.getCurrDesign().equals("Delivery")) {
				//root.getChildren().add(new Conflict(null,"Delivery interaction must ALWAYS reach a group named \"Auth\" that verifies the human's identity. Either this group does not exist, or it is not guaranteed reachable!", "nofix", null, null, null, null));
				//System.out.println("Interaction violating delivery");
			}
			
			if (ia.isViolatingBranch()) {
				if (!addedPropertyCategories.contains("Branching Errors")) {
					//System.out.println("Interaction violating branch");
					addedPropertyCategories.add("Branching Errors");
					//root.getChildren().add(propertyCategories.get("Branching Errors"));
				}
				if(!ia.hasSpecialViolation("Branching Errors")){ //unknown how this works
						Violation speechViolation = new Violation("Branching Errors", true, "Branch conditions insufficient");

					}else{
						//violation already added
					}	
				// POSSIBLY NEEDED    propertyCategories.get("Branching Errors").getChildren().add(new Conflict(null, "Branch conditions insufficient (See grayed-out transitions. Are you using else statements appropriately?).", "ia", null, null, null, null));
			}
			if (ia.isViolatingSequential()) {
				//System.out.println("Interaction violating sequential");
				if (!addedPropertyCategories.contains("Jams")) {
					addedPropertyCategories.add("Jams");
				//	root.getChildren().add(propertyCategories.get("Jams"));
				}
					if(!ia.hasSpecialViolation("Jams")){
						Violation speechViolation = new Violation("Jams", true, "Sequential composition of groups insufficient (see transitions with red or yellow indicators)");

					}else{
						//violation already added
					}	
				// POSSIBLY NEEDED propertyCategories.get("Jams").getChildren().add(new Conflict(null, ".", "ia", null, null, null, null, null, null));
			}
			//System.out.println("finished checking interaction properties");
			HashMap<Integer,Boolean> graphPropertyValues;
			
			/*
			 * Group-specific proeprties
			 */

            //System.out.println("checking group propertie");

			for (Group group : ia.getGroups()) { //this is how original code was ported, this should be refactored to allow other special violations in the future
				if (group.getViolating()) {
					if (!addedPropertyCategories.contains("Speech Flubs")) {
						addedPropertyCategories.add("Speech Flubs");
					
					}

					if(!ia.hasSpecialViolation("Speech Flubs")){
						Violation speechViolation = new Violation("Speech Flubs", false, "Robot may interrupt the human's speech");
						speechViolation.addGroupViolating(group);
					}else{
						ia.getSpecialViolation("Speech Flubs").addGroupViolating(group);
					}	
					



					//POSSIBLY NEEDED  propertyCategories.get("Speech Flubs").getChildren().add(new Conflict(null, "In " + group.getName() + ", robot may interrupt the human's speech.", "nofix", null, null, group, mc, null, null));
				}
				
				// initialize the group lookup if not already initialized
				if (!graphPropGroupConflictLookup.containsKey(group)){
					//System.out.println("	added this group to group graphpropgroupconflict lookup");
					graphPropGroupConflictLookup.put(group, new HashMap<Integer,Conflict>());
				}


					
				//System.out.println("	checking all properties to see if violation happened in group");
				// add conflicts!
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

							// if the list of group conflicts does not already contain this one, add it
							if (!graphPropGroupConflictLookup.get(group).containsKey(prop.getID())) {
								graphPropGroupConflictLookup.get(group).put(prop.getID(), new Conflict(prop, ((prop.getContext() != null)?(prop.getContext() + " " + group.getName() + ", "):"") + prop.getDescription(), "nofix", null, null, group, mc));
							}
							if (!addedPropertyCategories.contains(prop.getCategory())) {
								addedPropertyCategories.add(prop.getCategory());
							//	root.getChildren().add(propertyCategories.get(prop.getCategory()));
							}
							//POSSIBLY NEEDED propertyCategories.get(prop.getCategory()).getChildren().add(graphPropGroupConflictLookup.get(group).get(prop.getID()));
						}
					}
				}
				
				// get list of modules
				//System.out.println("Now getting list of modules");
			//	addGazeGestureConflicts(group); --note this is how we catch gesture and gaze conflicts
			}
            //System.out.println("done printing out groups, now checking interaction properties specifically");


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
							//root.getChildren().add(propertyCategories.get(prop.getCategory()));
						}
						//POSSIBLY NEEDED propertyCategories.get(prop.getCategory()).getChildren().add(graphPropIAConflictLookup.get(prop.getID()));
					}
				}
			}
		}
	}
	
	public void addGazeGestureConflicts(Group group) {
		//System.out.println(" *********** adding gaze gester conflict **********");
		ArrayList<Module> allMods = group.getMacrointeraction().getModules();
		
		for (ModBehPair mbp : group.allRelevantBehaviorConflicts(allMods)) {
			//System.out.println("error 221 ViolationPane here");
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
/*
	private final class AlertTreeCell extends TreeCell<HBox> {

        private final AnchorPane anchorPane;
        private Tooltip tool;

        public AlertTreeCell() {
			System.out.println(" alert tree called **************");
            anchorPane = new AnchorPane();
            anchorPane.setStyle("-fx-border-color: darkgray;"
        			+ "-fx-focus-color: blue;" 
        			+ "-fx-background-color: white;");
            anchorPane.setPadding(new Insets(5));
            anchorPane.setFocusTraversable(false);
            tool = new Tooltip("Cannot pipoint error to a specific point in the interaction.");
            this.setFocusTraversable(false);
            //this.setDisclosureNode(null);
            this.setStyle("-fx-focus-color: transparent;"
        			+ "-fx-background-color: white;");
            TreeCell tc = this;
            
            this.addEventFilter(MouseEvent.MOUSE_ENTERED, new EventHandler<MouseEvent>() {
            	
                @Override
                public void handle(MouseEvent event) {
                	TreeItem ti = tc.getTreeItem();
                	if (ti != null) {
                		Group group = ((Conflict) ti).getGroup();
                		if (group != null) {
                			if (((Conflict) ti).getChoices() == null)
                				group.activateNegativeFeedback();
                			else
                				group.activateBlinker();
                		}
                   		
                		else if (group == null && ((Conflict) ti).getDescription().contains("Sequential composition")) {
                			for (GroupTransition macro : ia.getMacroTransitions()) {
                				if (!macro.getBadConnections().isEmpty()) {
                					macro.activateNegativeFeedback();
                				}
                			}
                		}
                		
                		else if (group == null && ((Conflict) ti).getDescription().contains("Branch conditions")) {
            				for (Group g : ia.getGroups()) {
            					if (!g.checkBranchingPartition()[1]) {
		            				for (GroupTransition macro : g.getOutputMacroTransitions()) {
		            					macro.activateNegativeFeedback();
		            				}
            					}
            				}
            			}
                		else {
            				Tooltip.install(anchorPane, tool);
                		}
                	}
                }
                
            });
            
            this.addEventFilter(MouseEvent.MOUSE_EXITED, new EventHandler<MouseEvent>() {
            	
                @Override
                public void handle(MouseEvent event) {
                	TreeItem ti = tc.getTreeItem();
                	if (ti != null) {
                		Group group = ((Conflict) ti).getGroup();
                		if (group != null) {
                			if (((Conflict) ti).getChoices() == null)
                				group.deactivateNegativeFeedback();
                			else
                				group.deactivateBlinker();
                		}
                		
                		\
                		else if (group == null && ((Conflict) ti).getDescription().contains("Sequential composition")) {
                			for (GroupTransition macro : ia.getMacroTransitions()) {
                				if (!macro.getBadConnections().isEmpty()) {
                					macro.deactivateNegativeFeedback();
                				}
                			}
                		}
                		
                		else if (group == null && ((Conflict) ti).getDescription().contains("Branch conditions")) {
            				for (Group g : ia.getGroups()) {
            					if (!g.checkBranchingPartition()[1]) {
		            				for (GroupTransition macro : g.getOutputMacroTransitions()) {
		            					macro.deactivateNegativeFeedback();
		            				}
            					}
            				}
            			}
                		else {
            				Tooltip.uninstall(anchorPane, tool);
                		}
                	}
                }
                
            });
            
            this.addEventFilter(MouseEvent.MOUSE_PRESSED, new EventHandler<MouseEvent>() {
            	
                @Override
                public void handle(MouseEvent event) {
                	setStyle("-fx-background-color: white;");
                }
                
            });
            
            this.addEventFilter(MouseEvent.MOUSE_RELEASED, new EventHandler<MouseEvent>() {
            	
                @Override
                public void handle(MouseEvent event) {
                	setStyle("-fx-background-color: white;");
                }
                
            });
            
            anchorPane.addEventFilter(MouseEvent.MOUSE_PRESSED, new EventHandler<MouseEvent>() {
            	
                @Override
                public void handle(MouseEvent event) {
                	TreeItem ti = getTreeItem();
                	if (ti.isExpanded())
                		ti.setExpanded(false);
                	else
                		ti.setExpanded(true);
                }
            });
            
            anchorPane.addEventFilter(MouseEvent.MOUSE_RELEASED, new EventHandler<MouseEvent>() {
            	
                @Override
                public void handle(MouseEvent event) {
                	//anchorPane.setStyle("-fx-border-color: darkgray;"
                	//		+ "-fx-focus-color: blue;" 
                	//		+ "-fx-background-color: white;");
                }
            });
        }

        @Override
        public void updateItem(HBox item, boolean empty) {
			System.out.println("updaing item hbox ****************************");
            super.updateItem(item, empty);
            if (empty) {
                //setText(null);
                setGraphic(null);
                anchorPane.getChildren().clear();
                //anchorPane.setStyle("-fx-border-color: darkgray;"
            	//		+ "-fx-focus-color: blue;" 
            	//		+ "-fx-background-color: white;");
                this.setStyle("-fx-focus-color: transparent;"
            			+ "-fx-background-color: white;");
            } else {
                //setText(null);
                //label.setText(item.getStatus());
                //button.setText(item.getName());
                //setGraphic(anchorPane);
            	anchorPane.getChildren().add(item);
            	setGraphic(anchorPane);
            	this.setPadding(new Insets(2));
            	this.setFocusTraversable(false);
            	//this.setDisclosureNode(null);
            	//anchorPane.setStyle("-fx-border-color: darkgray;"
            	//		+ "-fx-focus-color: blue;" 
            	//		+ "-fx-background-color: white;");
            	this.setStyle("-fx-focus-color: transparent;"
            			+ "-fx-background-color: white;");
            }
        }
    }
	*/
}



