package model_ctrl;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Properties;

import controller.ErrDController;
import controller.ImportMicrosCT;
import model.MicroBox;
import aCheck.Globals;

/*
 * Class that handles all file and directory related queries 
 * 
 * Initializes the file system
 * 
 * Validates all files present in the Library
 * 
 * Verifies Interaction sanity
 * 
 * Loads and sets program specifications
 */
public class FSManager {

	private final File WORKSPACE;
	private Properties prop;
	private InputStream input;
	private ArrayList<String> flagFiles;
	private String USERFOLDER;
	public FSManager(String USERFOLDER) { //NOTE used to be empty
		this.USERFOLDER = USERFOLDER;
		//Set the current workspace. This is the application directory
		WORKSPACE = new File(USERFOLDER);
		prop = new Properties();
		flagFiles = new ArrayList<String>();
		//Read the properties file to set the necessary conditions for the program.
		try {
			input = new FileInputStream(Globals.RESOURCEPATH + "Master" +File.separator+ "Configuration" +File.separator+ "config.properties");
			prop.load(input);
		} catch (FileNotFoundException e) {
			ErrDController edc = new ErrDController();
			edc.display("No Config File Found", e);
		}
		catch (IOException e){
			ErrDController edc = new ErrDController();
			edc.display("Error loading Config File", e);
		}
	}

	/*
	 * Adds all the files to be ignored when populating the project explorer
	 */
	public void initialize() {
		String str[] = prop.getProperty("flagFiles").split(" | ");
		for (int i = 0; i < str.length; i++) {
			flagFiles.add(str[i]);
		}
	}

	//Get the grid state from the properties file
	public boolean getGrid() {
		if (prop.getProperty("gridState").equals("false")) {
			return false;
		} else {
			return true;
		}
	}
	//Get the font size for annotations from the properties file
	public int getFontSize() {
		return Integer.parseInt(prop.getProperty("fontSize"));
	}
	//Get the font to be used from the properties file
	public String getFont() {
		return prop.getProperty("font");
	}

	//Get the radius for states from the properties file
	public int getStateSize() {
		return Integer.parseInt(prop.getProperty("stateSize"));
	}
	
	//Get all the microinteractions types in the Library
	public ArrayList<File> getMicroDirs(){
		ArrayList<File> microDirs = new ArrayList<>();
		File dir = new File(getPath() + File.separator + "Lib");
		for(File files: dir.listFiles()){
				microDirs.add(files);
		}

		return microDirs;
	}
	
	//Get a list of microboxes from the current directory. Used to populate the Library tab
	public ArrayList<MicroBox> getMicrosInDir(File dir){
		ArrayList<MicroBox> microConfigs = new ArrayList<>();
		
		for(File file : dir.listFiles()){
			if (!file.getName().equals(".DS_Store")) {
				String fileName = dir.getName();

			}
		}

		return microConfigs;
	}
	
	//Get all the microinteractions in the lib folder as microboxes. Used in the lib tab


	//TODO Implement this method so it can write to the properties file before the program shuts down
	//Save any changes such as new font, fontsize, base state size, grid status
	public void setConfigFile() {

	}
	
	//Get the current workspace
	public String getPath(){
		return WORKSPACE.getAbsolutePath();
	}

}
