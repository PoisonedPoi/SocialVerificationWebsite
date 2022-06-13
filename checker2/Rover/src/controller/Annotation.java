package controller;
import java.awt.Point;
import java.util.ArrayList;

import aCheck.ModelFileChecker;
import model.Guard;
import model.State;
import model.Sync;
import model.Transition;
import model.Update;

/*
 * Class that holds the annotations for the state and transition
 * 
 * Holds all the necessary controllers for the text box
 * 
 * Processes and formats all the strings for the transitions
 */

 /*
 *  This can probably be removed as of now
 */

public class Annotation {

	private double X, Y;
	private String text;

	private ModelFileChecker mc;
	private int objType, isCollapse;
	public static String FONT;
	public static int FONTSIZE;
	private Object obj;
		
	public Annotation(State state,  ModelFileChecker mc) {
		obj = state;
		isCollapse = 0;
		objType = 0;
		text = formatStr(0);
		this.mc = mc;
		initialize();
	}
	
	public Annotation(ArrayList<Object> objects, String objType, ModelFileChecker mc) { //, Point xy, Pane pane, model..
		if (objType.equals("Guard")) {
			this.objType = 1;
		}
		else if (objType.equals("Update")) {
			this.objType = 2;
		}
		else {
			this.objType = 3;
		}
		
		obj = objects;
		
		isCollapse = 0;
	
	}
	
	

	//Formats the strings as needed depending on the mode
	private String formatStr(int mode) {
		String str = "";
		switch (mode) {
		case 0:
			return ((State) obj).getName().trim();
		case 1:
			ArrayList<Guard> guards = ((ArrayList<Guard>)(ArrayList<?>) obj);
			for (Guard g : guards) {
				//System.out.println(g);
				str += g.stringify() + "\n";
			}

			return str;
		case 2:
			ArrayList<Update> updates = ((ArrayList<Update>)(ArrayList<?>) obj);
			for (Update u : updates)
				str += u.stringify() + "\n";
			return str;
		case 3:
			ArrayList<Sync> syncs = ((ArrayList<Sync>)(ArrayList<?>) obj);
			for (Sync s : syncs)
				str += s.stringify() + "\n";
			return str;
		case 4:
			if (objType == 0) {
				return (((State) obj).getName().charAt(0) + "").toUpperCase();
			} else if (objType == 1) {
				String transFin = "Transition: " + ((Transition) obj).getSource().getName() + " -> "
						+ ((Transition) obj).getTarget().getName();
				return transFin;
			}
		}
		return null;
	}

	
	/*
	 * Method used to set all the controllers for the Annotation box
	 * 
	 * Initializes context menus as well as mouse event handlers
	 */
	public void initialize() {
	


	}
	
}
