package checkers;
import java.util.ArrayList;

import aCheck.ModelFileChecker;
import model.Group;
import model.GroupTransition;
import model.Interaction;
import model.Microinteraction;

public class PrismThread implements Runnable {
	
	// IMPORTANT: flip this switch to "true" to disable prism
	private final boolean disablePrism = false;
	
	// necessary references
	private Checker c;
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
			if (c == null){
				//System.out.println(ia.getUSERFOLDER() + "|	PRISM THREAD: Starting Prism and Making Checker");
				this.startPrism();
				return;
			}
				

			//System.out.println("\n" + ia.getUSERFOLDER() + "|	PRISM THREAD: Starting " + type + "   ");
			if (type.equals("concurrent")) {
				c.generatePrismFile(group.getMacrointeraction());
				c.checkConcurrent(group);
			}
			else if (type.equals("startEndStates")) {
				//System.out.println(ia.getUSERFOLDER() + "|	PRISM THREAD:		Parameter " +micro.toString());
				
				//System.out.println(ia.getUSERFOLDER() + "|	PRISM THREAD:		generateprismfile " +micro.toString());
				//System.out.println("PRISM THREAD: start-end states");
				c.generatePrismFile(micro);
				//c.dotExporter(micro);
				//System.out.println(ia.getUSERFOLDER() + "|	PRISM THREAD:		getstartendstates " +micro.toString());
				
				c.getStartEndStates(micro);
				//System.out.println("PRISM THREAD: obtained start end states");
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
				c.checkGraph(ia);
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
				//System.out.println("Calling the exporter");
				c.tmExporter(micro);
			}
			else if (type.equals("generatePrismFile")) {
				c.generatePrismFile(micro);
			}
			//System.out.println(ia.getUSERFOLDER() + "|	PRISM THREAD: DONE " + type + " operation finished");
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
		//System.out.println(ia.getUSERFOLDER() + "|	PRISM THREAD-starprism: Making Checker" + "   " );
		c = new Checker(ia, mc.getNonAssistedSwitch(), ia.getGraphProperties());
		c.generatePrismFiles();
		c.startPrism();
		//System.out.println(ia.getUSERFOLDER() + "|	PRISM THREAD-startprism: Setting Checker in interaction       ");
		ia.setChecker(c, mc);
		//System.out.println(ia.getUSERFOLDER() + "|	PRISM THREAD-startprism: Checker Set       ");
		
		mc.startDesign();
	}
	
}
