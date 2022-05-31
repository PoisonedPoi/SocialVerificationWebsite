package checkers;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.util.ArrayList;

import aCheck.Globals;
import aCheck.ModelFileChecker;

import model.Group;
import repair.Fix;


public class Conflict {
	
	private ModBehPair mbp;
	private Group group;
	private Property prop;
	private ArrayList<String> choices;
	
	private ModelFileChecker mc;
	
	private String describe;
	
	//This was kept as other functional code needed references to conflicts, this is now replaced by violations
	
	@SuppressWarnings({ "restriction", "unchecked" })
	public Conflict(Property prop, String describe, String type, ArrayList<String> choices, ModBehPair mbp, Group group, ModelFileChecker mc) {
		if(prop == null){
			//System.out.println("prop is null");
		}else if(type == null){
			//System.out.println(" type is null");
		}else{
			//System.out.println("conflict made for " + prop.toString() + "Type " + type);
		}
		//System.out.println("got here in conflict");
		this.mc = mc;
		this.group = group;
		this.mbp = mbp;
		this.prop = prop;
		this.describe = describe;
		this.choices = choices;
		
	}
	
	
		//TreeItem<HBox> root = new TreeItem<HBox>(components);
		//this.setRoot(root);
		//this.setValue(components);
				

		/*
		String path = "Icons" + File.separator;
		this.helperImage = helperImage;
		try {
			violation = new Image(new FileInputStream(path + "violation.png"));
			warning = new Image(new FileInputStream(path + "warning.png"));
			good = new Image(new FileInputStream(path + "Icon_Check.png"));
			path += "property_icons" + File.separator;
			greeting = new Image(new FileInputStream(path + "greeting.png"));
			farewell = new Image(new FileInputStream(path + "farewell.png"));
			task = new Image(new FileInputStream(path + "task.png"));
			instruct = new Image(new FileInputStream(path + "instruct.png"));
			sequential = new Image(new FileInputStream(path + "sequential.png"));
			speech = new Image(new FileInputStream(path + "speech_flubs.png"));
			branch = new Image(new FileInputStream(path + "branch.png"));
			turntake = new Image(new FileInputStream(path + "turntake.png"));
			waiting = new Image(new FileInputStream(path + "waiting.png"));
			other = new Image(new FileInputStream(path + "other.png"));
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		*/
		
		//components.setSpacing(10);
		
	
	
	public Group getGroup() {
		return group;
	}
	
	public String getDescription() {
		return describe;
	}
	
	public Property getProp() {
		return prop;
	}
	
	public ArrayList<String> getChoices() {
		return this.choices;
	}
}