package model_ctrl;

import model.Interaction;

import java.io.File;

import aCheck.ModelFileChecker;
import javafx.stage.FileChooser;

public class Importer {
	
	ModelFileChecker mc;
	private Interaction ia;
	private File inFile;
	private String absFilePath;

	public Importer(String absFilePath, Interaction ia, ModelFileChecker mc) {
		this.ia = ia;
		this.mc = mc;
		FileChooser fc = new FileChooser();
		inFile = fc.showOpenDialog(null);
		this.absFilePath = absFilePath;
	}
	
	public void importInteraction() {
		Decoder d = new Decoder(mc, mc.getNonAssistedSwitch());
		//System.out.println(inFile);
		String path = inFile.getAbsolutePath();
		d.readSupreme(path, ia);
	}
	
}
