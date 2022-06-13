package model;

import java.io.File;
import java.io.FileInputStream;
import java.lang.reflect.Field;
import java.util.ArrayList;

import image.Conditions;


import study.BugTracker;



public class GroupTransition  {
	private Group source;
	private Group target;
	

	// branching conditions
	Conditions conditions;
	
	// branching
	boolean[] humanBranching;
	boolean[] breakdownBranching;
	boolean el;
	
	
	// temp
	private double X;
	private double Y;
	private boolean linked;
	// used for removing temp points (top left corner of the target)
	private double savedX;
	private double savedY;
	
	// breakpoint
	private boolean broke;
	
	// condition
	private Boolean isNonAssisted;
	
	// bug tracking
	BugTracker bt;
	
	// feedback
	private boolean allowNegativeFeedback;
	
	// for the bug tracker
	private ArrayList<ArrayList<Microinteraction>> badConnections;
	
	public GroupTransition(Group s,  BugTracker bt, Boolean isNonAssisted) {
		source = s;
		target = null;

		linked = false;
		this.bt = bt;
		this.isNonAssisted = isNonAssisted;
		
		initialize();
	}
	
	public GroupTransition(Group s, Group t, BugTracker bt) {
		source = s;
		target = t;
		linked = true;
		//this.bt = bt;
		
		initialize();
		//initializeIndicator();
	}
	
	public void initialize() {
		// initialize the branching
		humanBranching = new boolean[3];
		for (int i = 0; i < humanBranching.length; i++)
			humanBranching[i] = true;
		breakdownBranching = new boolean[2];
		for (int i = 0; i < breakdownBranching.length; i++)
			breakdownBranching[i] = true;
		el = false;
		source.addOutputMacroTrans(this);
		if (linked) {
			target.addInputMacroTrans(this);
			//getPoints().addAll(target.getLayoutX(), target.getLayoutY());
		}
		else {
			//getPoints().addAll(X, Y);
		}
		//setStrokeWidth(3);

		// bug tracking
		badConnections = new ArrayList<ArrayList<Microinteraction>>();
		
		allowNegativeFeedback = false;
		}

	
	public void addBugTracker(BugTracker bt) {
		this.bt = bt;
	}
	
	/*
	 * Getters
	 */
	public ArrayList<ArrayList<Microinteraction>> getBadConnections() {
		return badConnections;
	}
	
	public Group getSource() {
		return source;
	}
	
	public Group getTarget() {
		return target;
	}
	
	public boolean isLinked() {
		return linked;
	}
	
	public boolean[] getHumanBranching() {
		return humanBranching;
	}
	
	public boolean[] getBreakdownBranching() {
		return breakdownBranching;
	}
	
	public boolean[] getAllBranching() {
		boolean[] allBranching = new boolean[humanBranching.length + breakdownBranching.length];
		for (int i = 0; i < breakdownBranching.length; i++)
			allBranching[i] = breakdownBranching[i];
		for (int i = 0; i < humanBranching.length; i++)
			allBranching[i + breakdownBranching.length] = humanBranching[i];
		
		return allBranching;
	}
	
	public void setAllHumanBranching(boolean val) {
		humanBranching[0] = val;
		humanBranching[1] = val;
		humanBranching[2] = val;
	}
	
	public boolean setAllHumanBranching(boolean[] vals) {
		//System.out.println(humanBranching[0] + " " + humanBranching[1] + " " + humanBranching[2]);
		//System.out.println(vals[0] + " " + vals[1] + " " + vals[2]);
		boolean changed = false;
		if (vals[0] != humanBranching[0] || vals[1] != humanBranching[1] || vals[2] != humanBranching[2])
			changed = true;
		humanBranching[0] = vals[0];
		humanBranching[1] = vals[1];
		humanBranching[2] = vals[2];
		return changed;
	}
	
	public boolean getElse() {
		return el;
	}
	
	/*
	 * Setters
	 */
	
	public void unGray() {
		// this.setStroke(Color.BLACK);
		// this.poly.setFill(Color.BLACK);
		// this.indicOutline.setFill(Color.BLACK);
	}
	
	public void grayOut() {
		// this.setStroke(Color.LIGHTGRAY);
		// this.poly.setFill(Color.LIGHTGRAY);
		// this.indicOutline.setFill(Color.LIGHTGRAY);
	}
	
	public void setElse(boolean val) {
		el = val;
	}
	
	public void setLinked(boolean linked) {
		this.linked = linked;
	}
	
	
	
	public void setTarget(Group group) {
		
		target = group;
		
		//initializeIndicator();
		// grayOut if necessary
		if (!source.checkBranchingPartition()[0]) {
			source.greyAllMacroTransitionsOut();
		}


		
		if (!source.checkBranchingPartition()[1]) {
			if (source.getWasGoodPartition()) {
				source.setGoodPartition(false);
			}
		}

	}
	
	
	
	public Conditions getConditions() {
		return conditions;
	}
	
	//public void displayElseCondition() {
	//	this.conditions.getGraphicsContext2D().clearRect(0, 0, 62, 10);
	//	this.conditions.getGraphicsContext2D().fillText("(else)", 0, 10);
	//}
	
	public void updateAndDisplayConditions() {
		Group group = getSource();
		boolean[] goodPartition = group.checkBranchingPartition();
		
		if (goodPartition[0]) {
			for (GroupTransition mtran : group.getOutputMacroTransitions()) {
				mtran.unGray();
			}
		}
		// else, change all macrotransitions to gray
		else {
			for (GroupTransition mtran : group.getOutputMacroTransitions()) {
				mtran.grayOut();
				if (mtran.getElse()) {
					boolean[] conditions = {true, true, false, false, false};
					//mtran.updateConditions(conditions, true);
					//mtran.displayElseCondition();
				}
			}
			
			group.disableOutputTransitions();
		}
		
		if (goodPartition[1]) {
			if (!group.getWasGoodPartition()) {
				group.setGoodPartition(true);
			}
		}
		else {
			if (group.getWasGoodPartition()) {
			//	bt.addBug("branching", group);
				group.setGoodPartition(false);
			}
		}
		
		// update macrotransition condition indicator
		boolean noBreakCondition = breakdownBranching[0];
		boolean breakCondition = breakdownBranching[1];
		boolean readyCondition = humanBranching[0];
		boolean busyCondition = humanBranching[1];
		boolean ignoreCondition = humanBranching[2];
	}
	
	private boolean[] getElseConditions(Group group) {
		boolean noBreakCondition = true;
		boolean breakCondition = true;
		boolean readyCondition = true;
		boolean busyCondition = true;
		boolean ignoreCondition = true;
		for (GroupTransition mtrans : group.getOutputMacroTransitions()) {
			/*
			 * BREAKDOWN BRANCHING
			boolean[] tempBreakBranch = mtrans.getBreakdownBranching();
			if (tempBreakBranch[0])
				noBreakCondition = false;
			if (tempBreakBranch[1])
				breakCondition = false;
			*/
			
			boolean[] tempHumanBranch = mtrans.getHumanBranching();
			if (tempHumanBranch[0])
				readyCondition = false;
			if (tempHumanBranch[1])
				busyCondition = false;
			if (tempHumanBranch[2])
				ignoreCondition = false;
		}
		
		boolean[] toReturn = {noBreakCondition, breakCondition, readyCondition, busyCondition, ignoreCondition};
		return toReturn;
	}



	

	/*
	 * copy
	 */
	public GroupTransition copy(Group source, Group target) {
		// initialize new and link everything up
		GroupTransition macroCopy = new GroupTransition(source, target, null);
		
		// branching
		boolean[] humanBranchCopy = macroCopy.getHumanBranching();
		humanBranchCopy[0] = humanBranching[0];
		humanBranchCopy[1] = humanBranching[1];
		humanBranchCopy[2] = humanBranching[2];
		
		//macroCopy.setPoly(new Polygon());
		
		return macroCopy;
	}
	
	public String toString() {
		String str = "";
		str += source.getName();
		str += target.getName();
		return str;
	}

	public void activateNegativeFeedback() {
		allowNegativeFeedback = true;
	}
	
	public void deactivateNegativeFeedback() {
		allowNegativeFeedback = false;
	}
	
	public boolean getNegativeFeedbackAllowance() {
		return allowNegativeFeedback;
	}

}
