package controller;

import javafx.scene.control.TextArea;
import aCheck.ModelFileChecker;
// Console class
public class ConsoleCT extends TextArea {
	
	ModelFileChecker mc;
	
	public ConsoleCT(ModelFileChecker mc) {
		this.mc = mc;
	}
	
	public void display(){
		setWrapText(true);
		setEditable(false);
		setText(">> Welcome to RoboVerify, the UW - Madison tool for constructing and analyzing human-robot interactions. \n>>");
	}
	
	public void clear(){
		setText("");
	}
	
	public void updateText(String str){
		if (!mc.getNonAssistedSwitch())
			setText(getText());
			//setText(getText() + str + "\n>>");
	}
}
