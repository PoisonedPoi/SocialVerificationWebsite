package checkers;
import java.util.ArrayList;

import controller.ConsoleCT;
import aCheck.ModelFileChecker;
import model.Group;
import model.GroupTransition;
import model.Interaction;
import model.Microinteraction;
import javafx.application.Platform;

public class PrismThread implements Runnable {
	
	// IMPORTANT: flip this switch to "true" to disable prism
	private final boolean disablePrism = false;
	
	// necessary references
	private Checker c;
	private ConsoleCT console;
	private Interaction ia;
	private ModelFileChecker mc;
	private Microinteraction micro;
	private Group group;
	private GroupTransition mt;
	
	private Thread t;
	private String type;
	
	public PrismThread( Interaction ia, ModelFileChecker mc) {
		this.mc = mc;
		this.micro = null;
		this.mt = null;
		this.group = null;
		initialize(ia);
	}
	
	public PrismThread(Interaction ia, ModelFileChecker mc, Microinteraction micro) {
		this.mc = mc;
		this.micro = micro;
		this.mt = null;
		this.group = null;
		initialize(ia);
	}
	
	public PrismThread(Interaction ia, ModelFileChecker mc, GroupTransition mt) {
		this.mc = mc;
		this.micro = null;
		this.group = null;
		this.mt = mt;
		initialize(ia);
	}
	
	public PrismThread( Interaction ia, ModelFileChecker mc, Group group) {
		this.mc = mc;
		this.group = group;
		this.micro = null;
		this.mt = null;
		initialize( ia);
	}
	
	private void initialize( Interaction ia) {
		this.c = ia.getChecker();

		this.ia = ia;
		t = new Thread(this, "prism");
	}
	
	public Thread getThread() {
		return t;
	}
	
	public void start(String type, String engine) {
		c.switchEngine(engine);
		start(type);
	}

	public void start(String type) {
		this.type = type;
		t.start();
	}
	
	public void run() {
		if (!disablePrism) {
			if (c == null)
				this.startPrism();
			
			if (type.equals("concurrent")) {
				c.generatePrismFile(group.getMacrointeraction());
				c.checkConcurrent(group);
			}
			else if (type.equals("startEndStates")) {
				System.out.println("PRISM THREAD: start-end states");
				c.generatePrismFile(micro);
				//c.dotExporter(micro);
				c.getStartEndStates(micro);
				System.out.println("PRISM THREAD: obtained start end states");
			}
			else if (type.equals("sequential")) {
				if (mt == null)
					c.checkSequential();
				else
					c.checkSequential(mt);
			}
			else if (type.equals("graph")) {
				c.checkGraph(ia);
			}
			else if (type.equals("allConcurrent")) {
				for (Group group : ia.getGroups()) {
					if (!group.getMicrointeractions().isEmpty()) {
						group.createReducedMergedMacrointeraction(c,  ia, mc); //gota do it
						c.generatePrismFile(group.getMacrointeraction());
						c.checkConcurrent(group);
					}
				}
			}
			else if (type.equals("concurrentAndGraph")) {
				// TODO: THIS SHOULD NOT NEED TO BE A THING
				ArrayList<Group> copy = new ArrayList<Group>(ia.getGroups());
				for (Group group : copy) {
					if (!group.getMicrointeractions().isEmpty()) {
						group.createReducedMergedMacrointeraction(c, ia, mc);
						c.generatePrismFile(group.getMacrointeraction());
						c.checkConcurrent(group);
					}
				}
				System.out.println(" done with setup in concurrent and graph");
				c.checkGraph(ia);
				// update the conflict pane
				/*
				Platform.runLater(
						() -> {
							mc.updateConflictPane();////////////////////////////////////////////
						}
					);
					*/
			}
			else if (type.equals("reachability")) {
				c.checkReachability();
			}
			else if (type.equals("endStateReachability")) {
				c.checkEndStateReachability(group);
			}
			else if (type.equals("exportToDot")) {
				c.generatePrismFile(micro);
				c.dotExporter(micro);
			}
			else if (type.equals("exportToTM")) {
				System.out.println("Calling the exporter");
				c.tmExporter(micro);
			}
			else if (type.equals("generatePrismFile")) {
				c.generatePrismFile(micro);
			}
		}
	}
	
	@SuppressWarnings("restriction")
	private void startPrism() {
		/*
		Platform.runLater(
			() -> {
				mc.notifyInitPrism();
			}
		);
		*/
		c = new Checker(ia, mc.getNonAssistedSwitch(), ia.getGraphProperties());
		
		c.generatePrismFiles();
		c.startPrism();
		
		if (ia.getIsCopy()) {
			ia.setChecker(c, mc);
		}
		else {
			ia.setChecker(c,mc);
		}
		mc.startDesign();
	}
	
}
