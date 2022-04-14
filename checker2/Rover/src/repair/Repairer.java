package repair;

import java.util.ArrayList;
import java.util.HashMap;

import controller.ImportMicrosCT;
import aCheck.ModelFileChecker;

import model.*;
import model.Group;
import java.awt.geom.Point2D;

public class Repairer {
	
	private Interaction ia;
	private ModelFileChecker mc;
	private ImportMicrosCT imct;
	
	ArrayList<Object> previewer;

	public Repairer(Interaction ia, ModelFileChecker mc, ImportMicrosCT imct) {
		this.ia = ia;
		this.mc = mc;
		this.imct = imct;
		
		previewer = new ArrayList<Object>();
	}
	
	public ArrayList<Interaction> repairAll(double startX, double startY, double dimX, double dimY) {
		System.out.println("Repairing");
		
		// handle the greeting prop
		if (!ia.getInit().getGreetingProp()) {
			//mc.addMicroToGroup(ia.getInit(), null);
			Group prevInit = ia.getInit();
			//Point2D.Double placement = calculateViolationXYPosition(prevInit, startX, startY, dimX, dimY);
			prevInit.setNotInit();
			Group group = new Group(true, ia.getBugTracker());
			ia.setInit(group);
			ia.addGroup(group);
			
			// find the greeter microinteraction and add it
			mc.addMicroToGroup(group, null);//imct.getMBFileByKeyword("Greeter")
			
			GroupTransition mtran = new GroupTransition(group, prevInit, ia.getBugTracker());
			//Polygon poly = new Polygon();
			//mtran.setPoly(poly);
			ia.addTransition(mtran);
			addGroup(group, null, mtran);
		}
		mc.verify();
		return null;
	}
	
	public void repair(int id, Object obj, double startX, double startY, double dimX, double dimY, boolean preview) {
		switch (id) {
		case 1:
			repairGreeterProp(startX, startY, dimX, dimY, preview);
			break;
		case 2:
			repairInstBusyProp((Group) obj, startX, startY, dimX, dimY);
			break;
		case 3:
			repairInstQuestProp((Group) obj, startX, startY, dimX, dimY);
			break;
		default:
			break;
		}
	
	}
	/*
	private Point2D.Double calculateViolationXYPosition(Group group, double startX, double startY, double dimX, double dimY) {
		double groupX = group.getLayoutX() + group.getWidth()/2;
		double groupY = group.getLayoutY() + group.getHeight()/2;
		
		if (groupX < dimX/2.0 + startX) { // left
			if (groupY < dimY/2.0 + startY) {  // top
				if ((dimX/2.0 + startX) - groupX > (dimY/2.0 + startY) - groupY)  // go left
					return new Point2D.Double(Math.max(group.getLayoutX() - 200, 0), group.getLayoutY());
				else // go top
					return new Point2D.Double(group.getLayoutX(), Math.max(group.getLayoutY() - 200, 0));
			}
			else {  // down
				if ((dimX/2.0 + startX) - groupX > groupY - (dimY/2.0 + startY))  // go left
					return new Point2D.Double(Math.max(group.getLayoutX() - 200, 0), group.getLayoutY());
				else // go down
					return new Point2D.Double(group.getLayoutX(), group.getLayoutY() + 200);
			}
		}
		else {   // right
			if (groupY < dimY/2.0 + startY) {  // top
				if (groupX - (dimX/2.0 + startX) > (dimY/2.0 + startY) - groupY)  // go right
					return new Point2D.Double(group.getLayoutX() + 200, group.getLayoutY());
				else // go top
					return new Point2D.Double(group.getLayoutX(), Math.max(group.getLayoutY() - 200, 0));
			}
			else {
				if (groupX - (dimX/2.0 + startX) > groupY - (dimY/2.0 + startY))  // go right
					return new Point2D.Double(Math.max(group.getLayoutX() - 200, 0), group.getLayoutY());
				else // go down
					return new Point2D.Double(group.getLayoutX(), group.getLayoutY() + 200);
			}
		}
	}
	*/
	private void addGroup(Group toAdd,  GroupTransition sourceTrans, GroupTransition targetTrans) {
	//	mc.addGroupHelper(toAdd, placement.getX(), placement.getY());
		
		if (targetTrans != null)
			mc.addMacroTrans(targetTrans);
		if (sourceTrans != null)
			mc.addMacroTrans(sourceTrans);
		
		// realign and update each transition's display
		//mc.realignTransitions();
		ia.updateAllAndDisplayConditions();
	}
	
	private void repairGreeterProp(double startX, double startY, double dimX, double dimY, boolean preview) {
		
		//mc.addMicroToGroup(ia.getInit(), null);
		Group prevInit = ia.getInit();
		//sPoint2D.Double placement = calculateViolationXYPosition(prevInit, startX, startY, dimX, dimY);
		
		Group group = new Group(true, ia.getBugTracker());
		//Polygon poly = new Polygon();
		
		
		if (!preview) {
			prevInit.setNotInit();
			ia.setInit(group);
			ia.addGroup(group);
			prevInit.setName("prevInit");
			prevInit.resetGraphPropertyValues();
			
			// find the greeter microinteraction and add it
			mc.addMicroToGroup(group, null); //imct.getMBFileByKeyword("Greeter")
			
			GroupTransition mtran = new GroupTransition(group, prevInit, ia.getBugTracker());
			//mtran.setPoly(poly);
			ia.addTransition(mtran);
			addGroup(group,  null, mtran);
			group.setName("init");
			
			mc.verify();
		}
		else {
			previewer.add(group);
			group.setName("");
			//group.setStyle("-fx-border-style: dashed;");
			//group.addMicroBoxShell(imct.getMBbyID(imct.getMBFileByKeyword("Greeter").toString()));
		//	mc.addGroupShell(group, placement.getX(), placement.getY());
			GroupTransition mt = new GroupTransition(group,prevInit,null);
			prevInit.getInputMacroTransitions().remove(mt);
			//mt.setPoly(poly);
			//mt.getStrokeDashArray().addAll(25d, 10d);
		//	mc.addMacroTransShell(mt);
			previewer.add(mt);
			
			// for (Circle node : mt.getIndicatorComponents()) 
			// 	previewer.add(node);
			
			//previewer.add(mt.getPoly());
			previewer.add(mt.getConditions());
			
			// align the dummy nodes
			ArrayList<Group> groupsToRealign = new ArrayList<Group>();
			groupsToRealign.add(group);
			groupsToRealign.add(prevInit);
			//mc.realignTransitions(groupsToRealign);
			mt.updateAndDisplayConditions();
		}
	}
	
	private void repairInstBusyProp(Group group, double startX, double startY, double dimX, double dimY) {
		/*
		 * GROUP with REMARK
		 */
		// add the remark
		Group group2 = new Group(false, ia.getBugTracker());
		GroupTransition mtran = new GroupTransition(group, group2, ia.getBugTracker());
		boolean[] humanBranching = {false, true, false};
		mtran.setAllHumanBranching(humanBranching);
		//Polygon poly = new Polygon();
		//mtran.setPoly(poly);
		ia.addTransition(mtran);
		//Point2D.Double placement = calculateViolationXYPosition(group, startX, startY, dimX, dimY);
		addGroup(group, mtran, null); //group, placement, ...
		
		// add the microinteraction
		mc.addMicroToGroup(group2, null);//imct.getMBFileByKeyword("Remark")
		
		// access the microinteraction and pre-set the parameter           --removed while removing javafx, could be important
		Microinteraction remark = group2.getMicrointeractions().get(0);
		// HashMap<Variable,Node> params = remark.getParameterizer().getParams();
		// for (Variable var : remark.getGlobalVars()) {
		// 	if (var.getType().equals("str")) {
		// 		var.setValue("I can help if you want.");
		// 		((TextArea) params.get(var)).setText(var.getValue());
		// 	}
		// }
				
		/*
		 * GROUP with WAIT
		 */
		// add the wait
		Group waitGroup = new Group(false, ia.getBugTracker());
		mc.addMicroToGroup(waitGroup, null);//imct.getMBFileByKeyword("Wait")
		GroupTransition mtranWait = new GroupTransition(group2, waitGroup, ia.getBugTracker());
		boolean[] humanBranchingWait = {false, true, false};
		mtranWait.setAllHumanBranching(humanBranchingWait);
		//Polygon polyWait = new Polygon();
		//mtranWait.setPoly(polyWait);
		ia.addTransition(mtranWait);
		//placement = calculateViolationXYPosition(group2, startX, startY, dimX, dimY);
				
		GroupTransition mtranWaitLoop = new GroupTransition(waitGroup, waitGroup, ia.getBugTracker());
		boolean[] humanBranchingWaitLoop = {false, true, false};
		mtranWaitLoop.setAllHumanBranching(humanBranchingWaitLoop);
		//Polygon polyWaitLoop = new Polygon();
		//mtranWaitLoop.setPoly(polyWaitLoop);
		ia.addTransition(mtranWaitLoop);
		addGroup(waitGroup,  mtranWait, mtranWaitLoop); //placement
				
		mc.verify();
		
		for (Group mc : ia.getGroups()) {
			System.out.println(mc.getName());
		}
	}
	
	private void repairInstQuestProp(Group group, double startX, double startY, double dimX, double dimY) {
		
	}
	
	public ArrayList<Object> getPreview() {
		return previewer;
	}
	
}



/*

getting xml xoc
java.io.FileNotFoundException
	at sparse.PrismSparse.ExportMDP(PrismSparse.java:486)
	at prism.NondetModel.exportToFile(NondetModel.java:419)
	at prism.Prism.exportTransToFile(Prism.java:2283)
	at checkers.TMExporter.exportToFile(TMExporter.java:40)
	at checkers.Checker.tmExporter(Checker.java:257)
	at checkers.PrismThread.run(PrismThread.java:152)
	at java.base/java.lang.Thread.run(Thread.java:833)
Exception in thread "prism" java.lang.NullPointerException
	at java.base/java.io.FileInputStream.<init>(FileInputStream.java:149)
	at java.base/java.io.FileReader.<init>(FileReader.java:75)
	at checkers.TMExporter.parseTM(TMExporter.java:63)
	at checkers.Checker.tmExporter(Checker.java:258)
	at checkers.PrismThread.run(PrismThread.java:152)
	at java.base/java.lang.Thread.run(Thread.java:833)
Getting scratch disk contents





airness is false
properties File is filter(print, Pmax=? [ st_m=4 ]);

java.io.FileNotFoundException: /home/new/rover/users/user2170/tempout.txt (No such file or directory)
	at java.base/java.io.FileOutputStream.open0(Native Method)
	at java.base/java.io.FileOutputStream.open(FileOutputStream.java:293)
	at java.base/java.io.FileOutputStream.<init>(FileOutputStream.java:235)
	at java.base/java.io.FileOutputStream.<init>(FileOutputStream.java:184)
	at java.base/java.io.PrintWriter.<init>(PrintWriter.java:309)
	at checkers.SequentialChecker.getEndStates(SequentialChecker.java:377)
	at checkers.SequentialChecker.getStartEndStates(SequentialChecker.java:56)
*/